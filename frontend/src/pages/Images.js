import React, { Component, useCallback } from 'react';

import Modal from '../components/Modal/Modal';
import Backdrop from '../components/Backdrop/Backdrop';
import AuthContext from '../context/auth-context';
import './Images.css';
import Spinner from '../components/Spinner/Spinner';

import moment from "moment";

import axios from 'axios'

import "react-datetime/css/react-datetime.css";


import Dropzone from "react-dropzone";

import {
    Grid,
    Card,
    CardContent,
    Typography,
    CardHeader,
    CardMedia,
    IconButton
} from '@material-ui/core/'

class ImagePage extends Component {

    state = {
        creating: false,
        images: [],
        isLoading: false,
        selectedImage: null,
        urlOfFile: "",
        search: null,
        fileNames: []
    };


    static contextType = AuthContext;

    constructor(props) {
        super(props);
        this.titleElRef = React.createRef();
        this.priceElRef = React.createRef();
        this.dateElRef = React.createRef();
        this.descriptionElRef = React.createRef();
    }

    componentDidMount() {
        this.fetchImages();
    }

    startCreateImageHandler = () => {
        this.setState({ creating: true });
    };

    modalConfirmHandler = async () => {
        this.uploadToS3(this.titleElRef.current.value, this.priceElRef.current.value, this.dateElRef.current.value);
    };

    modalCancelHandler = () => {
        this.setState({ creating: false, selectedImage: null, fileNames: [] });
    };

    fetchImages() {
        this.setState({ isLoading: true });
        const requestBody = {
            query: `
          query {
            images {
              _id
              name
              description
              date
              price
              creator {
                _id
                email
              }
            }
          }
        `
        };

        fetch('http://localhost:8080/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(res => {
                if (res.status !== 200 && res.status !== 201) {
                    throw new Error('Failed!');
                }
                return res.json();
            })
            .then(resData => {
                const images = resData.data.images;
                this.setState({ images: images });
                this.setState({ isLoading: false });
            })
            .catch(err => {
                console.log(err);
                this.setState({ isLoading: false });
            });
    }

    showImageHandler = imageId => {
        this.setState(prevState => {
            const selectedImage = prevState.images.find(e => e._id === imageId);
            return { selectedImage: selectedImage };
        });
    }


    //timage uplaoding to s3

    uploadToS3 = async (title, price, date) => {
        this.state.fileNames.map(file => {
            this.postRequestUpload(file, title, price, date);
        });
    };

    postRequestUpload = async (file, title, price, dates) => {
        // Split the filename to get the name and type
        let fileParts = file.name.split('.');

        let fileName = fileParts[0];
        let fileType = fileParts[1];

        const date = moment().format("YYYYMMDD");
        const randomString = Math.random()
            .toString(36)
            .substring(2, 7);
        const newFilename = `rev-${date}-${randomString}-${fileName}`;

        console.log(fileName + " -- " + fileType + "---" + newFilename)
        console.log("Preparing the upload");
        axios.post("http://localhost:8080/sign_s3", {
            fileName: newFilename,
            fileType: file.type
        })
            .then(response => {
                var returnData = response.data.data.returnData;
                var signedRequest = returnData.signedRequest;
                var url = returnData.url;
                this.setState({ urlOfFile: url })
                console.log("Recieved a signed request " + url);

                var options = {
                    headers: {
                        'Content-Type': fileType,
                        'Access-Control-Allow-Origin': '*',
                    }
                };
                axios.put(signedRequest, file, options)
                    .then(result => {
                        console.log("Response from s3")
                        this.AddImageToDB(url, title, price, dates);
                    })
                    .catch(error => {
                        alert("ERROR " + JSON.stringify(error));
                    })
            })
            .catch(error => {
                alert(JSON.stringify(error));
            })
    }

    AddImageToDB = async (url, titleValue, priceValue, dateValue) => {
        this.setState({ creating: false });
        const title = titleValue;
        const price = priceValue;
        const date = dateValue;
        const description = url;

        if (
            title.trim().length === 0 ||
            price <= 0 ||
            date.trim().length === 0 ||
            description.trim().length === 0
        ) {
            return;
        }

        const image = { name: title, price, date, description };
        console.log(image);

        const requestBody = {
            query: `
          mutation {
            createImage(imageInput: {name: "${title}", description: "${description}", price: ${price}, date: "${date}"}) {
              _id
              name
              description
              date
              price
            }
          }
        `
        };

        const token = this.context.token;

        fetch('http://localhost:8080/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token
            }
        })
            .then(res => {
                if (res.status !== 200 && res.status !== 201) {
                    throw new Error('Failed!');
                }
                return res.json();
            })
            .then(resData => {
                this.setState(prevState => {
                    const updatedImages = [...prevState.images];
                    updatedImages.push({
                        _id: resData.data.createImage._id,
                        name: resData.data.createImage.name,
                        description: resData.data.createImage.description,
                        date: resData.data.createImage.date,
                        price: resData.data.createImage.price,
                        creator: {
                            _id: this.context.userID
                        }
                    });
                    return { images: updatedImages };
                });
            })
            .catch(err => {
                console.log(err);
            });
    }


    deleteImageHandler = imageId => {
        this.setState({ isLoading: true });
        const requestBody = {
            query: `
              mutation {
                deleteImage(deleteImageId: "${imageId}") {
                 _id
                 name
                }
              }
            `
        };

        fetch('http://localhost:8080/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + this.context.token
            }
        })
            .then(res => {
                if (res.status !== 200 && res.status !== 201) {
                    throw new Error('Failed!');
                }
                return res.json();
            })
            .then(resData => {
                this.setState(prevState => {
                    const updateImages = prevState.images.filter(image => {
                        return image._id !== imageId;
                    });
                    this.modalCancelHandler();
                    return { images: updateImages, isLoading: false };

                });
            })
            .catch(err => {
                console.log(err);
                this.setState({ isLoading: false });
            });
    };
    handleDrop = async files => {
        const imageNames = files.map(file => {
            return file;
        });
        this.setState({ fileNames: imageNames })
    }

    searchSpace = (event) => {
        let keyword = event.target.value;
        this.setState({ search: keyword })
    }

    render() {
        return (
            <React.Fragment>
                {(this.state.creating || this.state.selectedImage) && <Backdrop />}
                {this.state.creating && (
                    <Modal
                        title="Add Image"
                        canCancel
                        canConfirm
                        buttonName="Upload"
                        onCancel={this.modalCancelHandler}
                        onConfirm={this.modalConfirmHandler}
                    >
                        <form>
                            <div className="form-control">
                                <label htmlFor="title">Title</label>
                                <input type="text" id="title" ref={this.titleElRef} />
                            </div>
                            <div className="form-control">
                                <label htmlFor="price">Price</label>
                                <input type="number" id="price" ref={this.priceElRef} />
                            </div>
                            <div className="form-control">
                                <label htmlFor="date">Date</label>
                                <input type="date" id="date" ref={this.dateElRef} />
                            </div>
                        </form>
                        <label>Image</label>
                        <Dropzone accept="image/*" multiple={true} onDrop={this.handleDrop}>
                            {({ getRootProps, getInputProps }) => (
                                <div {...getRootProps({ className: "dropzone" })}>
                                    <input {...getInputProps()} />
                                    <p>Drag'n'drop files, or click to select files</p>
                                </div>
                            )}
                        </Dropzone>
                        <p>You have selected: {this.state.fileNames.length} files.</p>
                    </Modal>
                )
                }
                {
                    this.context.token && (
                        <div className="images-control">
                            <p>Share your own images!</p>
                            <button className="btn" onClick={this.startCreateImageHandler}>
                                Create Image
                              </button>
                        </div>
                    )
                }
                {
                    this.state.selectedImage && (
                        <Modal
                            title={this.state.selectedImage.name}
                            canCancel
                            canConfirm
                            buttonName="Delete"
                            onCancel={this.modalCancelHandler}
                            onConfirm={this.deleteImageHandler.bind(this, this.state.selectedImage._id)}
                        >
                            <h1>⚠️ Are you sure you want to delete this image?</h1>
                        </Modal>
                    )
                }

                <div>
                    <input type="text" placeholder="Enter image to be searched" style={{
                        border: 'solid',
                        left: '18vh',
                        height: '5vh',
                        fontSize: 25,
                        width: '100%',
                        marginTop: '1vh',
                        marginBottom: '10vh'
                    }} onChange={(e) => this.searchSpace(e)} />
                </div>

                {
                    this.state.isLoading ? (<Spinner />) :
                        (
                            <Grid
                                container
                                spacing={2}
                                direction="row"
                                justify="flex-start"
                                alignItems="flex-start"
                            >
                                { this.state.images.filter((data) => {
                                    if (this.state.search == null)
                                        return data
                                    else if (data.name.toLowerCase().includes(this.state.search.toLowerCase())
                                        || data.description.toLowerCase().includes(this.state.search.toLowerCase())
                                        || (data.price <= parseFloat(this.state.search) + 1)) {
                                        return data
                                    }
                                }).map(elem => (
                                    <Grid item xs={12} sm={6} md={3} key={this.state.images.indexOf(elem)}>

                                        <Card style={{ display: 'flex' }} >
                                            <div style={{ display: 'flex', flexDirection: "column" }} >
                                                <CardContent style={{ flex: "1 0 auto" }}>
                                                    <Typography component="h5" variant="h5">
                                                        {elem.name}
                                                    </Typography>
                                                    <Typography>
                                                        ${elem.price}
                                                    </Typography>
                                                </CardContent>
                                                <div >
                                                    {this.context.token ? (

                                                        this.context.userID === elem.creator._id && this.context.token ? (
                                                            <button className="btn-edit" onClick={this.showImageHandler.bind(this, elem._id)}>
                                                                Edit
                                                            </button>
                                                        ) : (
                                                            <React.Fragment>
                                                                <button disabled="true" className="btn">
                                                                    can not edit
                                                                </button>
                                                            </React.Fragment>
                                                        )

                                                    ) : (
                                                        <p></p>
                                                    )}

                                                </div>
                                            </div>
                                            <CardMedia
                                                style={{ width: "100%" }}
                                                image={elem.description}
                                                title={elem.name}
                                            />
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>


                        )
                }
            </React.Fragment >
        );
    }
}

export default ImagePage;

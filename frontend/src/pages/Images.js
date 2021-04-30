import React, { Component, useCallback } from 'react';

import Modal from '../components/Modal/Modal';
import Backdrop from '../components/Backdrop/Backdrop';
import AuthContext from '../context/auth-context';
import './Images.css';
import Spinner from '../components/Spinner/Spinner';

import "react-datetime/css/react-datetime.css";

import Dropzone from "react-dropzone";


class ImagePage extends Component {

    state = {
        creating: false,
        images: [],
        isLoading: false,
        selectedImage: null,
        fileNames: [null]
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

    modalConfirmHandler = () => {
        this.setState({ creating: false });
        const title = this.titleElRef.current.value;
        const price = +this.priceElRef.current.value;
        const date = this.dateElRef.current.value;
        const description = this.descriptionElRef.current.value;

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
    };

    modalCancelHandler = () => {
        this.setState({ creating: false, selectedImage: null });
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

    handleDrop = acceptedFiles => {
        const imageNames = acceptedFiles.map(file => {
            return {filename: file.name, imagePrev: file.path};
        });
        this.setState({ fileNames: imageNames })
    }

    render() {
        const imageList = this.state.images.map(image => {
            return (
                <li key={image._id} className="images__list-item">
                    <div>
                        <h1>{image.name}</h1>
                        <h2>
                            ${image.price} - {new Date(image.date).toLocaleDateString()}
                        </h2>
                    </div>
                    <div>
                        {this.context.userID === image.creator._id ? (
                            <p>Your the owner of this event.</p>
                        ) : (
                            <button className="btn" onClick={this.showImageHandler.bind(this, image._id)}>
                                View Details
                            </button>
                        )}
                    </div>
                </li>
            );
        });

        return (
            <React.Fragment>
                {(this.state.creating || this.state.selectedImage) && <Backdrop />}
                {this.state.creating && (
                    <Modal
                        title="Add Image"
                        canCancel
                        canConfirm
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
                            <div className="form-control">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    rows="4"
                                    ref={this.descriptionElRef}
                                />
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
                        <div>
                            <ul>
                                {this.state.fileNames.map(fileName => (
                                   fileName && <img src={fileName.filename} />)
                                )}
                            </ul>
                        </div>
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
                            onCancel={this.modalCancelHandler}
                            onConfirm={this.modalCancelHandler}
                        >
                            <h1>{this.state.selectedImage.name}</h1>
                        </Modal>
                    )
                }
                {
                    this.state.isLoading ? (<Spinner />) :
                        (<ul className="images__list">{imageList}</ul>)
                }
            </React.Fragment >
        );
    }
}

export default ImagePage;

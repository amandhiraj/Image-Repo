# ShopifyHereWeGo :) 

# Setting up Amazon S3
The following steps are mandatory for this program to work properly. 
1. Use the following link to make an Amazon S3 account: https://s3.console.aws.amazon.com/<br>
2. Create Bucket and name it 'shopify-challenge-aman' (make sure it is exactly the same)<br>
![image](https://user-images.githubusercontent.com/40723562/116836351-36554700-ab94-11eb-92a3-13e73c027c05.png)<br>
    - choose region<br>
    - uncheck "Block all public access"<br>

3.) Setting up Bucket Policy
  Copy + paste the following bucket-policy
  ```json
  {
    "Version": "2008-10-17",
    "Statement": [
        {
            "Sid": "AllowCannedAcl",
            "Effect": "Allow",
            "Principal": {
                "AWS": "*"
            },
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:PutObjectAcl"
            ],
            "Resource": "arn:aws:s3:::shopify-challenge-aman/*"
        }
    ]
}
```


4. Setting up CORS 
   Copy + paste the follwing cors
   ```json
   [
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "POST",
            "PUT",
            "DELETE"
        ],
        "AllowedOrigins": [
            "*"
        ],
        "ExposeHeaders": [
            "Content-Range",
            "Content-Length",
            "ETag"
        ],
        "MaxAgeSeconds": 3000
    }
   ]```
6. Generate KEYS by going to account -> My security Credentials -> Access Keys -> Create New Access Key -> download the keys for the next step
![image](https://user-images.githubusercontent.com/40723562/116836763-d2338280-ab95-11eb-950b-4ca9ef7d367f.png)![image](https://user-images.githubusercontent.com/40723562/116836815-f727f580-ab95-11eb-8910-7dd90065cb82.png)


8. Make a <code>.env</code> file inside the <code>backend folder</code> with the following:
```
AWS_KEY= Enter your Access Key ID
AWS_S_KEY= Enter You Secret key
AWS_REGION= Enter the Region you selected for bucket eg. (ca-central-1)
AWS_BUCKET=shopify-challenge-aman
```

# Steps to run
1.) Run <code> npm install </code> on both Frontend and backend<br>
2.) Run <code> npm start </code> in both frontend and backend.<br>

# What I used
1.) GraphQL<br>
2.) Node.js<br>
3.) MongoDB<br>
4.) React.js<br>
5.) S3 Aws services<br>
6.) Express.js<br>

# Message to Recruiter/HR
Feel free to message me if there are some errors when running this app or general questions. Please see the email on the attached resume with my application.

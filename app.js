const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const audioPlayer = document.getElementById('audioPlayer');
const sendButton = document.getElementById('sendButton');
const selectButton = document.getElementById('selectButton');
const origImage = document.getElementById('origImage');
const sdImage = document.getElementById('sdImage');

let audioChunks = [];
let mediaRecorder;
let audioBlob;

const imageList = [
    "https://i.insider.com/62ead859076fd300189cf1f3?width=1000&format=jpeg&auto=webp",
    "https://i.insider.com/5c79a8cfeb3ce837863155f5?width=700&format=jpeg&auto=webp",
    "https://i.insider.com/5c799f24eb3ce83534329ce3?width=700&format=jpeg&auto=webp",
    "https://i.insider.com/5c7998e3eb3ce81f55185d57?width=700&format=jpeg&auto=webp",
    "https://i.insider.com/5c79aa22eb3ce823b570a3d2?width=700&format=jpeg&auto=webp",
    "https://i.insider.com/5ea6fd9dd553f808ba5bf897?width=700&format=jpeg&auto=webp",
]

// randomly choose a picture
selectButton.addEventListener('click', () => {
    idx = Math.floor(Math.random() * imageList.length)
    console.log("select idx=",idx,"from list len=",imageList.length)
    origImage.src = imageList[idx]
});

// Function to start recording audio
startButton.addEventListener('click', () => {
    startButton.disabled = true;
    stopButton.disabled = false;
    audioChunks = [];
    
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
            mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                audioPlayer.src = URL.createObjectURL(audioBlob);
                sendButton.disabled = false;
            };

            mediaRecorder.start();
        })
        .catch((error) => {
            console.error('Error accessing microphone:', error);
        });
});

// Function to stop recording audio
stopButton.addEventListener('click', () => {
    startButton.disabled = false;
    stopButton.disabled = true;
    mediaRecorder.stop();
});

// Function to send audio to AWS Lambda via API Gateway
sendButton.addEventListener('click', () => {
    sendButton.disabled = true;

    const formData = new FormData();
    formData.append('audio', audioBlob);
    var object = {};
    formData.forEach(function(value, key){
        object[key] = value;
    });

    // Convert audioBlob to base64
    const reader = new FileReader();
    reader.onload = () => {
        const base64Data = reader.result.split(',')[1]; // Extract base64 data
        const jsonData = { audio: base64Data };
    
        fetch('https://xa27mikv31.execute-api.us-west-2.amazonaws.com/test/', {
            method: 'POST',
            body: JSON.stringify(jsonData),
        })
        .then((response) => response.json())
        .then((data) => {
            // Handle the response from AWS Lambda here
            console.log('Response from AWS Lambda:', data);
            console.log('image url',data.body.img_url)
            sdImage.src = data.body.img_url//"https://kyle-anyscale-sandbox.s3.us-west-1.amazonaws.com/raydemo/image.png?AWSAccessKeyId=ASIAVLLH5BVC7QQPNGP2&Signature=J7%2BE8FccJ6GJBvS8Wla%2BRFEj5K0%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEDQaCXVzLXdlc3QtMiJHMEUCIDnUy4NctIsdjJFnbpk464gDXLtdHXumz7QE9f7%2BClQxAiEA22PI7frd58ABPQ9h7Fm2hw%2BHQ8G1ewiZO0S9BBkKR94q4gIIHRABGgwzNjc5NzQ0ODUzMTciDBvZdMuTbdbD2pxvPCq%2FAnAFlDAE4Pom66zs2BslStwltpThJK3BKkx3PlR%2BJ6cjTz6ThrgWuU%2FfGfdTSTG6eDFy950S3nazPlMVPEpCDc7RdTJbscxu9EFHUr46QzNQV9T11KFxEGRBKpJTY5WSN%2BO4ws9fzIBFF1HBw%2BqencpL8pySZJVsmiRjA2vIXcy%2BjNytY3yFkuPYQRIXKrpyr545cwzgaYPeFmhfSSHuFDtrm0UmomN4tsOZQXz4gS1Z502aEPUHUZrLIxzJHD6bh6fnpCJutRr5cPsLKqLrQhm%2ByH3TPp5hSASwugVhLyi47Oz6sQAjGIwRcsqWLJWhYBYAVP8CIdx6M6bBsTH213Bc1oFrklbHhCraKHrLlpk%2FhTuTfJX2RyRR6Q4NBoXERnzY8n7O1igZKGKN5JP3YorolPkud%2BfJVdJN6fqqmaMwqYaDqAY6ngGIPbq5hqcya6hb4iY6pPt2QEEzzFFfOj64zD%2F%2BTH%2FbXjzEQm7%2FAan9C%2FFv9AfNdqoxRouHAHzvmo%2BPjcyXrv7Sq2OvjGZNphF3%2BhwUjthyO6k4PRWx5BsAUNXXIa9RD0BG9RYNvZX%2B3rMQb4KfLhZNXa9l9VHLjoMWsbLJ5xg0w%2BkbauiYjAZIssHsNVcj7DVKmu7uAs%2BnVbIMNIN%2FdQ%3D%3D&Expires=1694549791"
            // data.img_url
        })
        .catch((error) => {
            console.error('Error sending audio to AWS Lambda:', error);
        });
    };
    reader.readAsDataURL(audioChunks[0]); // Read the first chunk
});


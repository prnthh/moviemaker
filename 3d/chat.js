// chat.js

class ChatGPT {
  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  callChatGPT(message) {
    // Return a promise that resolves with the response or rejects with an error
    return new Promise((resolve, reject) => {
      // Construct the payload
      const payload = {
        prompt: message,
      };

      resolve(message + " (mocked)");
      return;

      // Initialize a new XMLHttpRequest
      const xhr = new XMLHttpRequest();

      // Set up the request
      xhr.open("POST", this.endpoint, true);
      xhr.setRequestHeader("Content-Type", "application/json");

      // Set up a function that is called when the request is completed
      xhr.onload = () => {
        if (xhr.status === 200) {
          // Parse the JSON response
          const response = JSON.parse(xhr.responseText);
          resolve(response.choices[0].text);
        } else {
          // If the request was not successful, reject the promise
          reject(new Error(`Request failed with status: ${xhr.status}`));
        }
      };

      // Handle network errors
      xhr.onerror = () => {
        reject(new Error("Network error"));
      };

      // Send the request with the payload
      xhr.send(JSON.stringify(payload));
    });
  }
}

// Export the ChatGPT class
export default ChatGPT;

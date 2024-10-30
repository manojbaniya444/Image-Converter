const fileSelect = document.getElementById("fileSelect");
const form = document.getElementById("form");
const selectFormat = document.getElementById("format");
const fetchImagesPathButton = document.getElementById("fetch-image-path");

let selectedImageFormat = selectFormat.value;

selectFormat.addEventListener("change", (event) => {
  selectedImageFormat = event.target.value;
  console.log(selectedImageFormat);
});

async function getImageStatus(token) {
  try {
    const response = await fetch("http://localhost:8080/api/check-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });
    const responseParse = await response.json();
    return responseParse;
  } catch (error) {
    console.error(error);
  }
}

function displayImages(imagesPath) {
  const imageContainer = document.getElementById("image-container");
  imageContainer.innerHTML = "";
  const list = document.createElement("div");
  imagesPath.forEach((image) => {
    const listItem = document.createElement("p");
    const downloadButton = document.createElement("button");
    downloadButton.textContent = "Download";
    listItem.textContent = image;
    list.appendChild(listItem);
    list.appendChild(downloadButton);

    downloadButton.addEventListener("click", async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/api/download-image",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token, filename: image }),
          }
        );
        const blob = await response.blob();
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        const imageOriginalNameEndIndex = image.indexOf("-");
        const imageOriginalName = image.slice(0, imageOriginalNameEndIndex);
        link.download = imageOriginalName;
        link.click();
        link.remove();
      } catch (error) {
        console.error(error);
      }
    });
  });
  imageContainer.appendChild(list);
}

function poolRequestForImagePath(token) {
  const interval = setInterval(async () => {
    console.log("Pooling");
    const response = await getImageStatus(token);
    const status = response.status;
    console.log("Status: ", status);

    if (response && status == "completed") {
      clearInterval(interval);
      console.log("INFO: Conversion completed");

      const response = await fetchImagesPath(token);
      const imagesPath = response.allImagesName;
      displayImages(imagesPath);
    } else {
      console.log("not completed yet");
    }
  }, 1000);
}

async function fetchImagesPath(token) {
  try {
    const response = await fetch(
      "http://localhost:8080/api/download-images-path",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      }
    );
    const responseParse = await response.json();
    return responseParse;
  } catch (error) {
    console.error(error);
  }
}

fetchImagesPathButton.addEventListener("click", async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.log("No token found");
    return;
  }
  const response = await fetchImagesPath(token);
  const imagesPath = response.allImagesName;

  displayImages(imagesPath);
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  console.log("INFO: Form submitted");
  const formData = new FormData();

  for (let i = 0; i < fileSelect.files.length; i++) {
    if (i >= 5) {
      console.log("You can only upload 5 images at a time");
      break;
    }
    formData.append("photos", fileSelect.files[i]);
  }
  const userUploadId = Date.now() + "-" + Math.round(Math.random() * 1e9);
  formData.append("targetFormat", selectedImageFormat);
  formData.append("userUploadId", userUploadId);

  try {
    console.log("INFO: Uploading images");
    const response = await fetch("http://localhost:8080/api/upload-images", {
      method: "POST",
      body: formData,
      headers: {
        userUploadId: userUploadId,
      },
    });
    const responseParse = await response.json();
    const { token } = responseParse;
    // save to the local storage
    localStorage.setItem("token", token);

    // wait for the conversion to finish
    console.log("INFO: Waiting for conversion to finish");
    poolRequestForImagePath(token);
  } catch (error) {
    console.error(error);
  }
});

const fileSelect = document.getElementById("fileSelect");
const form = document.getElementById("form");
const selectFormat = document.getElementById("format");

let selectedImageFormat = selectFormat.value;

selectFormat.addEventListener("change", (event) => {
  selectedImageFormat = event.target.value;
  console.log(selectedImageFormat);
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
  } catch (error) {
    console.error(error);
  }
});

const fetchImagesPath = async (token) => {
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
};

const fetchImagesPathButton = document.getElementById("fetch-image-path");
fetchImagesPathButton.addEventListener("click", async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.log("No token found");
    return;
  }
  const response = await fetchImagesPath(token);
  const imagesPath = response.allImagesName;

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
      console.log(`Downloading ${image}`);
    });
  });
  imageContainer.appendChild(list);
});

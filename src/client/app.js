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
    const response = await fetch("http://localhost:8080/api/upload-images", {
      method: "POST",
      body: formData,
      headers: {
        userUploadId: userUploadId,
      },
    });
    const responseParse = await response.json();
    console.log(responseParse);
  } catch (error) {
    console.error(error);
  }
});

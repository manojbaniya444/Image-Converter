import React from "react";

const PreviewImages = (props: any) => {
  const { selectedFormat, setSelectedFormat, files } = props;
  return (
    <div>
      {files.length > 0 && (
        <div >
          {files.map((file, index) => {
            <div key={index}>
              <img src={file.preview} alt="" />
            </div>;
          })}
        </div>
      )}
    </div>
  );
};

export default PreviewImages;

import React, { useState } from "react";
import { useCourses } from "../context/CoursesContext";

function FileUpload({ contentType, courseId, contentId }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const { courses, setCourses } = useCourses();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setUploadStatus(""); // Reset status on new selection
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setUploadStatus("Please select a file first");
      return;
    }

    setUploadStatus("Uploading...");

    try {
      let response;

      if (contentType === "lesson") {
        // --- CASE 1: PDF LESSON (FormData) ---
        const formData = new FormData();
        formData.append("pdfFile", selectedFile);
        // We don't need Content-Type header here;
        // fetch sets it to 'multipart/form-data' automatically

        response = await fetch(
          `/api/courses/${courseId}/content/${contentId}`,
          {
            method: "PATCH",
            body: formData,
          },
        );
      } else {
        // --- CASE 2: QUIZ JSON (JSON string) ---
        const reader = new FileReader();
        const jsonText = await new Promise((resolve, reject) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = () => reject("Failed to read JSON file");
          reader.readAsText(selectedFile);
        });

        // Basic validation before sending
        JSON.parse(jsonText);

        response = await fetch(
          `/api/courses/${courseId}/content/${contentId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: jsonText }),
          },
        );
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload file");
      }

      const updatedContentList = await response.json();

      // Update global context state
      setCourses(
        courses.map((course) =>
          course._id === courseId
            ? { ...course, contentlist: updatedContentList }
            : course,
        ),
      );

      setUploadStatus("File updated successfully!");
      setSelectedFile(null);
      // Optional: Clear the file input visually
      e.target.reset();
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Update {contentType === "lesson" ? "PDF" : "JSON"} File
            </label>
            <input
              type="file"
              accept={contentType === "lesson" ? ".pdf" : ".json"}
              onChange={handleFileChange}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm 
                         file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 
                         file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 
                         hover:file:bg-blue-100"
            />
          </div>

          <button
            type="submit"
            disabled={!selectedFile || uploadStatus === "Uploading..."}
            className={`px-4 py-2 rounded-md text-white font-medium transition-colors
              ${
                !selectedFile || uploadStatus === "Uploading..."
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 shadow-sm"
              }`}
          >
            {uploadStatus === "Uploading..." ? "Uploading..." : "Save Changes"}
          </button>
        </form>

        {uploadStatus && (
          <div
            className={`mt-4 text-sm font-medium ${
              uploadStatus.includes("successfully")
                ? "text-green-600"
                : uploadStatus === "Uploading..."
                  ? "text-blue-600"
                  : "text-red-600"
            }`}
          >
            {uploadStatus}
          </div>
        )}
      </div>
    </div>
  );
}

export default FileUpload;

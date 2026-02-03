// src/components/FileUpload.jsx
import React, { useState } from "react";
import { useCourses } from "../context/CoursesContext";

function FileUpload({ contentType, courseId, contentId }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [processedContent, setProcessedContent] = useState(null);
  const { courses, setCourses } = useCourses();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setUploadStatus("");
    setProcessedContent(null);

    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        if (contentType === "quiz") {
          // For JSON files, parse and validate the JSON
          const jsonObject = JSON.parse(e.target.result);
          setProcessedContent(JSON.stringify(jsonObject));
        } else {
          // For markdown files, just store the text content
          setProcessedContent(e.target.result);
        }
      } catch (err) {
        console.error(
          `Invalid ${contentType === "quiz" ? "JSON" : "file"}:`,
          err
        );
        setUploadStatus(
          `Error: Invalid ${contentType === "quiz" ? "JSON" : "file"} format`
        );
        setProcessedContent(null);
      }
    };

    reader.readAsText(file);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadStatus("Please select a file first");
      return;
    }

    // Validate file type
    const isMarkdown =
      contentType === "lesson" && selectedFile.name.endsWith(".md");
    const isJson =
      contentType === "quiz" && selectedFile.name.endsWith(".json");

    if (!isMarkdown && !isJson) {
      setUploadStatus(
        `Please upload a ${
          contentType === "lesson" ? "Markdown (.md)" : "JSON (.json)"
        } file`
      );
      return;
    }

    if (!processedContent) {
      setUploadStatus("Error processing file. Please try again.");
      return;
    }

    setUploadStatus("Uploading...");
    try {
      const response = await fetch(
        `/api/courses/${courseId}/content/${contentId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: processedContent,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload lesson");
      }

      setCourses(
        courses.map((c) => {
          if (c._id === courseId) {
            return {
              ...c,
              contentlist: c.contentlist.map((content, index) => {
                if (index === parseInt(contentId)) {
                  return {
                    ...content,
                    content: processedContent,
                  };
                }
                return content;
              }),
            };
          }
          return c;
        })
      );

      setUploadStatus("File uploaded successfully!");
      setSelectedFile(null);
      setProcessedContent(null);
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadStatus("Error uploading file. Please try again.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload {contentType === "lesson" ? "Markdown" : "JSON"} File
            </label>
            <input
              type="file"
              accept={contentType === "lesson" ? ".md" : ".json"}
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Upload
          </button>
        </form>
        {uploadStatus && (
          <div
            className={`mt-4 text-sm ${
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
      <div className="text-sm text-gray-600">
        <p>
          Note:{" "}
          {contentType === "lesson"
            ? "Please upload a Markdown (.md) file containing the lesson content."
            : "Please upload a JSON (.json) file with the quiz questions and answers."}
        </p>
      </div>
    </div>
  );
}

export default FileUpload;

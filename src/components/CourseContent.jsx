// src/components/CourseContent.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import ContentList from "./ContentList";
import ContentPreview from "./ContentPreview";

function CourseContent() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Routes>
        <Route index element={<ContentList />} />
        <Route path="lesson/:contentId" element={<ContentPreview />} />
        <Route path="quiz/:contentId" element={<ContentPreview />} />
      </Routes>
    </div>
  );
}

export default CourseContent;

// src/components/ContentPreview.jsx
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FileUpload from "./FileUpload";
import { useFetchCourses } from "../hooks/useFetchCourses";
import { useCourses } from "../context/CoursesContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function ContentPreview() {
  const { courseId, contentId } = useParams();
  const contentType = window.location.pathname.includes("/quiz/")
    ? "quiz"
    : "lesson";
  const navigate = useNavigate();
  const { courses, setCourses } = useCourses();
  // Find the course and its content
  const course = courses.find((c) => c._id === courseId);
  const content = course.contentlist[parseInt(contentId)];
  const { fetchCourses, loading, error } = useFetchCourses();

  const handleBack = () => {
    navigate(`/course/${courseId}`);
  };

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await fetchCourses();
        setCourses(data);
      } catch (err) {
        console.error("Error fetching courses:", err);
      }
    };
    loadCourses();
  }, [fetchCourses, setCourses]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
        <span className="ml-3 text-gray-600 text-lg">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <span className="text-red-600">Error: {error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          ← Back to Content List
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">{content.title}</h2>

        {contentType === "lesson" ? (
          // Lesson Preview
          <div className="prose max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ node, ...props }) => (
                  <h1
                    className="text-2xl font-bold text-gray-900 mb-4"
                    {...props}
                  />
                ),
                h2: ({ node, ...props }) => (
                  <h2
                    className="text-xl font-bold text-gray-800 mb-3"
                    {...props}
                  />
                ),
                h3: ({ node, ...props }) => (
                  <h3
                    className="text-lg font-bold text-gray-800 mb-2"
                    {...props}
                  />
                ),
                p: ({ node, ...props }) => (
                  <p className="text-gray-700 mb-4" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul
                    className="list-disc list-inside text-gray-700 mb-4"
                    {...props}
                  />
                ),
                ol: ({ node, ...props }) => (
                  <ol
                    className="list-decimal list-inside text-gray-700 mb-4"
                    {...props}
                  />
                ),
                li: ({ node, ...props }) => (
                  <li className="text-gray-700 mb-1" {...props} />
                ),
                table: ({ node, ...props }) => (
                  <table
                    className="border-collapse border border-gray-300 mb-4"
                    {...props}
                  />
                ),
                th: ({ node, ...props }) => (
                  <th
                    className="border border-gray-300 px-4 py-2 text-gray-900 bg-gray-100"
                    {...props}
                  />
                ),
                td: ({ node, ...props }) => (
                  <td
                    className="border border-gray-300 px-4 py-2 text-gray-700"
                    {...props}
                  />
                ),
                img: ({ node, ...props }) => (
                  <img
                    className="max-w-full h-auto rounded-lg mb-4"
                    {...props}
                  />
                ),
                a: ({ node, ...props }) => (
                  <a className="text-blue-600 hover:text-blue-800" {...props} />
                ),
                code: ({ node, ...props }) => (
                  <code
                    className="bg-gray-100 px-2 py-1 rounded text-gray-800"
                    {...props}
                  />
                ),
                pre: ({ node, ...props }) => (
                  <pre
                    className="bg-gray-100 p-4 rounded-lg mb-4 overflow-x-auto"
                    {...props}
                  />
                ),
                blockquote: ({ node, ...props }) => (
                  <blockquote
                    className="border-l-4 border-blue-500 pl-4 italic text-gray-600 mb-4"
                    {...props}
                  />
                ),
                hr: ({ node, ...props }) => (
                  <hr className="border-gray-300 my-6" {...props} />
                ),
              }}
            >
              {content.content}
            </ReactMarkdown>
          </div>
        ) : (
          // Quiz Preview
          <div className="space-y-6">
            {JSON.parse(content.content).map((question) => (
              <div key={question.id} className="space-y-4">
                <p className="text-gray-800 font-medium text-lg mb-2">
                  {question.question}
                </p>
                <div className="space-y-2">
                  {question.options.map((option, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        option === question.answer
                          ? "bg-green-100 border border-green-500 text-green-800"
                          : "bg-gray-50 text-gray-700"
                      }`}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 pt-6 border-t">
          <h3 className="text-lg font-semibold mb-4">Update Content</h3>
          <FileUpload
            contentType={contentType}
            courseId={courseId}
            contentId={contentId}
          />
        </div>
      </div>
    </div>
  );
}

export default ContentPreview;

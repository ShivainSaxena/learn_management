// src/components/ContentPreview.jsx
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FileUpload from "./FileUpload";
import { useFetchCourses } from "../hooks/useFetchCourses";
import { useCourses } from "../context/CoursesContext";

function ContentPreview() {
  const { courseId, contentId } = useParams();
  const navigate = useNavigate();
  const { courses, setCourses } = useCourses();
  const { fetchCourses, loading, error } = useFetchCourses();

  // Find the course and its content
  const course = courses.find((c) => c._id === courseId);
  const content = course?.contentlist[parseInt(contentId)];

  // Determine type based on data rather than URL path for better accuracy
  const contentType = content?.type;

  const handleBack = () => navigate(`/course/${courseId}`);

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

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (error || !content)
    return <div className="p-10 text-red-600">Error: Content not found</div>;

  return (
    <div className="space-y-6 mx-auto">
      <button
        onClick={handleBack}
        className="px-4 py-2 text-gray-600 hover:text-gray-800"
      >
        ← Back to Content List
      </button>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">{content.title}</h2>

        {contentType === "lesson" ? (
          /* SIMPLE PDF PREVIEW */
          <div className="w-full border rounded-lg overflow-hidden bg-gray-100">
            <iframe
              src={`${content.pdfUrl}#view=FitH`}
              title="PDF Preview"
              width="100%"
              height="800px"
              className="border-none"
            />
          </div>
        ) : (
          /* QUIZ PREVIEW (Remains the same) */
          <div className="space-y-6">
            {JSON.parse(content.content).map((question) => (
              <div key={question.id} className="space-y-4 border-b pb-4">
                <p className="text-gray-800 font-medium text-lg">
                  {question.question}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {question.options.map((option, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        option === question.answer
                          ? "bg-green-100 border border-green-500 text-green-800 font-semibold"
                          : "bg-gray-50 text-gray-700 border border-gray-200"
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

        <div className="mt-8 pt-6 border-t bg-gray-50 -m-6 p-6 rounded-b-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Replace/Update File
          </h3>
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

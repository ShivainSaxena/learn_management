// src/components/ContentList.jsx
import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useCourses } from "../context/CoursesContext";
import { useFetchCourses } from "../hooks/useFetchCourses";

function ContentList() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { courses, setCourses } = useCourses();
  const { fetchCourses, loading, error } = useFetchCourses();
  const course = courses.find((c) => c._id === courseId);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [lessonTitle, setLessonTitle] = useState("");
  const [quizTitle, setQuizTitle] = useState("");
  const [selectedLessonFile, setSelectedLessonFile] = useState(null);
  const [jsonString, setJsonString] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const deleteContent = async (contentId) => {
    setDeletingId(contentId);
    try {
      const response = await fetch(
        `/api/courses/${courseId}/content/${contentId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete content");
      }

      // Update local state by removing the deleted content
      setCourses(
        courses.map((c) => {
          if (c._id === courseId) {
            return {
              ...c,
              contentlist: c.contentlist.filter(
                (item) => item.id !== contentId,
              ),
            };
          }
          return c;
        }),
      );
    } catch (error) {
      console.error("Error deleting content:", error);
      alert("Failed to delete content. Please try again.");
    } finally {
      setDeletingId(null); // Stop Loading
    }
  };

  const saveContentOrder = async (newOrder) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/content/reorder`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newOrder }),
      });
      if (!response.ok) {
        throw new Error("Failed to save content order");
      }
    } catch (error) {
      console.error("Error saving content order:", error);
      alert("Failed to save content order. Please try again.");
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(course.contentlist);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    const newOrder = items.map((item) => item.id);
    // Update local state immediately
    setCourses(
      courses.map((c) => {
        if (c._id === courseId) {
          return {
            ...c,
            contentlist: items.map((item, index) => ({
              ...item,
              id: index,
            })),
          };
        }
        return c;
      }),
    );

    // Then update the backend
    saveContentOrder(newOrder);
  };

  const handleQuizUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setIsUploading(true);

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const jsonObject = JSON.parse(e.target.result);
        const stringified = JSON.stringify(jsonObject);
        setJsonString(stringified);
      } catch (err) {
        console.error("Invalid JSON file:", err);
        setJsonString("Error: Invalid JSON file");
      }
    };

    reader.readAsText(file);
    setIsUploading(false);
  };

  const saveLesson = async () => {
    if (!lessonTitle) {
      alert("Please enter a lesson title");
      return;
    }
    if (!selectedLessonFile) {
      alert("Please select a pdf file");
      return;
    }

    if (selectedLessonFile.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("title", lessonTitle);
      formData.append("type", "lesson");
      formData.append("pdfFile", selectedLessonFile);

      const response = await fetch(`/api/courses/${courseId}/content`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload lesson");
      }

      const data = await response.json();
      setCourses(
        courses.map((c) => {
          if (c._id === courseId) {
            return { ...c, contentlist: data };
          }
          return c;
        }),
      );

      setShowLessonModal(false);
      setLessonTitle("");
      setSelectedLessonFile(null);
    } catch (error) {
      console.error("Error uploading lesson:", error);
      alert("Failed to upload lesson. Please try again.");
    } finally {
      setIsUploading(false); // Stop Loading
    }
  };

  const saveQuiz = async () => {
    if (!quizTitle) {
      alert("Please enter a quiz title");
      return;
    }
    if (!jsonString) {
      alert("Please select a quiz file");
      return;
    }

    try {
      const response = await fetch(`/api/courses/${courseId}/content`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: quizTitle,
          type: "quiz",
          content: jsonString,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to upload quiz");
      }

      const data = await response.json();
      setCourses(
        courses.map((c) => {
          if (c._id === courseId) {
            return { ...c, contentlist: data };
          }
          return c;
        }),
      );

      setShowQuizModal(false);
      setQuizTitle("");
      setJsonString("");
    } catch (error) {
      console.error("Error uploading quiz:", error);
      alert("Failed to upload quiz. Please try again.");
    }
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
    <div className="space-y-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            ← Back to Dashboard
          </button>
          <div className="flex">
            <button
              onClick={() => setShowLessonModal(true)}
              className="px-4 py-2 bg-green-100 text-green-800 rounded hover:bg-green-200 mr-4"
            >
              Upload Lesson
            </button>
            <button
              onClick={() => setShowQuizModal(true)}
              className="px-4 py-2 bg-purple-100 text-purple-800 rounded hover:bg-purple-200"
            >
              Upload Quiz
            </button>

            {showLessonModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg w-96">
                  <h3 className="text-lg font-bold mb-4">Upload Lesson</h3>
                  <input
                    type="text"
                    placeholder="Lesson Title"
                    className="w-full p-2 border rounded mb-4"
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                  />
                  <label className="block mb-4">
                    <span className="sr-only">Choose lesson file</span>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(event) =>
                        setSelectedLessonFile(event.target.files[0])
                      }
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    />
                  </label>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setShowLessonModal(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveLesson}
                      disabled={isUploading}
                      className={`px-4 py-2 rounded text-white flex items-center ${
                        isUploading
                          ? "bg-green-400 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {isUploading && (
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      )}
                      {isUploading ? "Uploading..." : "Upload"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showQuizModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg w-96">
                  <h3 className="text-lg font-bold mb-4">Upload Quiz</h3>
                  <input
                    type="text"
                    placeholder="Quiz Title"
                    className="w-full p-2 border rounded mb-4"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                  />
                  <label className="block mb-4">
                    <span className="sr-only">Choose quiz file</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleQuizUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    />
                  </label>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setShowQuizModal(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveQuiz}
                      disabled={isUploading || !quizTitle || !jsonString}
                      className={`px-4 py-2 rounded text-white flex items-center transition-all ${
                        isUploading
                          ? "bg-purple-400 cursor-not-allowed"
                          : "bg-purple-600 hover:bg-purple-700 shadow-sm"
                      }`}
                    >
                      {isUploading && (
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      )}
                      {isUploading ? "Processing..." : "Upload Quiz"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-4">
          Course Content: {course?.title}
        </h2>
        <p className="text-gray-600">
          Grade: {course?.grade} | Subject: {course?.subject}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-6">Content List</h3>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="content">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`space-y-2 ${
                  snapshot.isDraggingOver ? "bg-blue-50" : ""
                }`}
              >
                {course.contentlist.map((item, index) => (
                  <Draggable
                    key={item.id}
                    draggableId={String(item.id)}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`p-4 rounded-lg border ${
                          snapshot.isDragging
                            ? "bg-blue-100 shadow-lg"
                            : "bg-white hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded ${
                                item.type === "lesson"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-purple-100 text-purple-800"
                              }`}
                            >
                              {item.type.toUpperCase()}
                            </span>
                            <span className="font-medium">{item.title}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Link
                              to={`/course/${courseId}/${item.type}/${item.id}`}
                              className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                            >
                              Preview
                            </Link>
                            <button
                              onClick={() => deleteContent(item.id)}
                              disabled={deletingId === item.id}
                              className={`px-3 py-1 rounded transition-colors ${
                                deletingId === item.id
                                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                  : "bg-red-100 text-red-600 hover:bg-red-200"
                              }`}
                            >
                              {deletingId === item.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                            <div
                              {...provided.dragHandleProps}
                              className="text-gray-400 cursor-move hover:text-gray-600"
                            >
                              ⋮⋮
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}

export default ContentList;

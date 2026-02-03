// src/components/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCourses } from "../context/CoursesContext";
import { useFetchCourses } from "../hooks/useFetchCourses";

function Dashboard() {
  const { courses, setCourses } = useCourses();
  const { fetchCourses, loading, error } = useFetchCourses();
  const [editingCourse, setEditingCourse] = useState(null);
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [newCourse, setNewCourse] = useState({
    title: "",
    grade: "",
    subject: "",
  });

  const handleSave = async (courseId, updatedData) => {
    const response = await fetch(`/api/courses/${courseId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: updatedData.title,
        grade: updatedData.grade,
        subject: updatedData.subject,
      }),
    });
    if (response.ok) {
      setCourses(
        courses.map((course) =>
          course._id === courseId ? { ...course, ...updatedData } : course
        )
      );
    } else {
      console.error("Failed to update course");
    }
    setEditingCourse(null);
  };

  const handleNewCourseChange = (e) => {
    const { name, value } = e.target;
    setNewCourse((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveNewCourse = async () => {
    if (!newCourse.title || !newCourse.grade || !newCourse.subject) {
      alert("Please fill in all fields");
      return;
    }

    const response = await fetch("/api/courses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newCourse),
    });

    const data = await response.json();

    if (response.ok) {
      setCourses([...courses, data]);
      setIsAddingCourse(false);
      setNewCourse({
        title: "",
        grade: "",
        subject: "",
      });
    } else {
      console.error("Failed to add course");
    }
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCourses(courses.filter((course) => course._id !== courseId));
      } else {
        console.error("Failed to delete course");
      }
    } catch (error) {
      console.error("Error deleting course:", error);
    }
    setCourseToDelete(null);
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Course Dashboard</h1>
        <button
          onClick={() => setIsAddingCourse(true)}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Add Course
        </button>
      </div>

      {isAddingCourse && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Add New Course</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Title
              </label>
              <input
                type="text"
                name="title"
                value={newCourse.title}
                onChange={handleNewCourseChange}
                className="w-full p-2 border rounded"
                placeholder="Enter course title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grade
              </label>
              <input
                type="text"
                name="grade"
                value={newCourse.grade}
                onChange={handleNewCourseChange}
                className="w-full p-2 border rounded"
                placeholder="Enter grade level"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={newCourse.subject}
                onChange={handleNewCourseChange}
                className="w-full p-2 border rounded"
                placeholder="Enter subject"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleSaveNewCourse}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Create Course
              </button>
              <button
                onClick={() => setIsAddingCourse(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course._id} className="bg-white rounded-lg shadow-md p-6">
            {editingCourse?._id === course._id ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editingCourse.title}
                  onChange={(e) =>
                    setEditingCourse({
                      ...editingCourse,
                      title: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded"
                />
                <input
                  type="text"
                  value={editingCourse.grade}
                  onChange={(e) =>
                    setEditingCourse({
                      ...editingCourse,
                      grade: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded"
                />
                <input
                  type="text"
                  value={editingCourse.subject}
                  onChange={(e) =>
                    setEditingCourse({
                      ...editingCourse,
                      subject: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSave(course._id, editingCourse)}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingCourse(null)}
                    className="bg-gray-500 text-white px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold">{course.title}</h2>
                  <button
                    onClick={() => setCourseToDelete(course)}
                    className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Delete course"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      />
                    </svg>
                  </button>
                </div>
                <p className="text-gray-600">Grade: {course.grade}</p>
                <p className="text-gray-600">Subject: {course.subject}</p>
                <div className="mt-4 flex space-x-2">
                  <Link
                    to={`/course/${course._id}`}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    View Content
                  </Link>
                  <button
                    onClick={() => {
                      setEditingCourse(course);
                    }}
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {courseToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the course "{courseToDelete.title}
              "? This action will permanently delete the course and all its
              content, including lessons and quizzes.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setCourseToDelete(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCourse(courseToDelete._id)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

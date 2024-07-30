// script.js

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBVBxgwHvPRUsMiDggziYZnLa5JuYTFI1E",
    authDomain: "lms-bm-reading.firebaseapp.com",
    projectId: "lms-bm-reading",
    storageBucket: "lms-bm-reading.appspot.com",
    messagingSenderId: "388779759262",
    appId: "1:388779759262:web:955d777ed608a2c1118d8f",
    measurementId: "G-44730J0JV0"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// DOM Elements
const contentArea = document.getElementById('content-area');
const logoutButton = document.getElementById('logoutButton');
const navLinks = document.querySelectorAll('nav a');

// Event Listeners
logoutButton.addEventListener('click', logout);
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        loadSection(e.target.id);
    });
});

// Load appropriate section
function loadSection(sectionId) {
    switch(sectionId) {
        case 'nav-overview':
            loadOverview();
            break;
        case 'nav-lessons':
            loadLessons();
            break;
        case 'nav-students':
            loadStudents();
            break;
        case 'nav-classrooms':
            loadClassrooms();
            break;
    }
}

// Load Lessons Section
function loadLessons() {
    contentArea.innerHTML = `
        <h2>Manage Lessons</h2>
        <div id="add-lesson-form">
            <input type="text" id="lesson-title" placeholder="Lesson Title">
            <textarea id="lesson-content" placeholder="Lesson Content"></textarea>
            <button id="add-lesson-button">Add Lesson</button>
        </div>
        <ul id="lesson-list"></ul>
    `;
    document.getElementById('add-lesson-button').addEventListener('click', addLesson);
    fetchLessons();
}

// Fetch Lessons
function fetchLessons() {
    const lessonList = document.getElementById('lesson-list');
    lessonList.innerHTML = 'Loading lessons...';
    db.collection("lessons").get().then((querySnapshot) => {
        lessonList.innerHTML = '';
        querySnapshot.forEach((doc) => {
            const lesson = doc.data();
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${lesson.title}</span>
                <button class="delete-button" onclick="deleteLesson('${doc.id}')">Delete</button>
            `;
            lessonList.appendChild(li);
        });
    }).catch((error) => {
        console.error("Error fetching lessons: ", error);
        lessonList.innerHTML = 'Error fetching lessons. Please try again.';
    });
}

// Add Lesson
function addLesson() {
    const title = document.getElementById('lesson-title').value;
    const content = document.getElementById('lesson-content').value;
    db.collection("lessons").add({
        title: title,
        content: content,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        alert("Lesson added successfully!");
        document.getElementById('lesson-title').value = '';
        document.getElementById('lesson-content').value = '';
        fetchLessons();
    })
    .catch((error) => {
        console.error("Error adding lesson: ", error);
        alert("Error adding lesson: " + error.message);
    });
}

// Delete Lesson
window.deleteLesson = function(lessonId) {
    if (confirm("Are you sure you want to delete this lesson?")) {
        db.collection("lessons").doc(lessonId).delete().then(() => {
            console.log("Lesson successfully deleted!");
            fetchLessons();
        }).catch((error) => {
            console.error("Error removing lesson: ", error);
            alert("Error deleting lesson: " + error.message);
        });
    }
}

// Logout function
function logout() {
    auth.signOut().then(() => {
        window.location.href = 'index.html'; // Redirect to login page
    }).catch((error) => {
        console.error("Logout error:", error);
        alert("Logout failed: " + error.message);
    });
}

// Check authentication state
auth.onAuthStateChanged((user) => {
    if (user) {
        loadSection('nav-overview'); // Load overview by default
    } else {
        window.location.href = 'index.html'; // Redirect to login page if not authenticated
    }
});

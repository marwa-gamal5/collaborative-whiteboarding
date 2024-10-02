App.jsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom'
import { Tldraw, track, useEditor } from 'tldraw'
import 'tldraw/tldraw.css'
import { useYjsStore } from './useYjsStore'

const HOST_URL =
  import.meta.env.MODE === 'development'
    ? 'ws://localhost:1234'
    : '' // Add production URL if needed

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RoleSelection />} />
        <Route path="/tldraw/:role" element={<YjsExample />} />
      </Routes>
    </Router>
  )
}

// Role selection component
function RoleSelection() {
  const navigate = useNavigate()

  const handleRoleSelection = (role) => {
    navigate(`/tldraw/${role}`)
  }

  return (
    <div className="role-selection">
      <h2>Select Your Role</h2>
      <button onClick={() => handleRoleSelection('student')}>Student</button>
      <button onClick={() => handleRoleSelection('teacher')}>Teacher</button>
    </div>
  )
}

// Main Tldraw component
function YjsExample() {
  const { role } = useParams() // Get role from URL params
  const store = useYjsStore({
    roomId: 'myroom/',
    hostUrl: HOST_URL,
  })

  return (
    <div className={`tldraw__editor ${role === 'student' ? 'read-only' : ''}`}  >
      <Tldraw
        autoFocus
        store={store}
        onMount={(editor) => {
          if (role === 'student') {
            editor.updateInstanceState({ isReadonly: true }) // Make the board read-only for students

            // Hide cursor and prevent any interaction for students
            editor.on('pointerMove', (e) => e.preventDefault())
            editor.on('pointerDown', (e) => e.preventDefault())
            editor.on('pointerUp', (e) => e.preventDefault())
            editor.on('pointerClick', (e) => e.preventDefault())
          }
        }}
        components={{
          // SharePanel: NameEditor,
        }}
      />
    </div>
  )
}

// NameEditor component for user preferences
const NameEditor = track(() => {
  const editor = useEditor()

  const { color, name } = editor.user.getUserPreferences()

  return (
    <div style={{ pointerEvents: 'all', display: 'flex' }}>
      <input
        type="color"
        value={color}
        onChange={(e) => {
          editor.user.updateUserPreferences({
            color: e.currentTarget.value,
          })
        }}
      />
      <input
        value={name}
        onChange={(e) => {
          editor.user.updateUserPreferences({
            name: e.currentTarget.value,
          })
        }}
      />
    </div>
  )
})
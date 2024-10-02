function YjsExample() {
  const { role } = useParams() // Get role from URL params
  const store = useYjsStore({
    roomId: 'myroom/',
    hostUrl: HOST_URL,
  })

  return (
    <div className={`tldraw__editor ${role === 'student' ? 'read-only' : ''}`}>
      <Tldraw
        autoFocus
        store={store}
        onMount={(editor) => {
          if (role === 'student') {
            editor.updateInstanceState({ isReadonly: true }) // Make the board read-only for students

            // Completely disable cursor and interactions for students
            editor.on('pointerMove', (e) => e.preventDefault())
            editor.on('pointerDown', (e) => e.preventDefault())
            editor.on('pointerUp', (e) => e.preventDefault())
            editor.on('pointerClick', (e) => e.preventDefault())
          }
        }}
        components={{
          SharePanel: NameEditor,
        }}
      />
    </div>
  )
}

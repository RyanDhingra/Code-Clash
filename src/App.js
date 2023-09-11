

function App() {
  return (
    <div className="app">
      <Router>
        <Routes>
          <Route exact path="/login" element={<Login />}/>
          <Route exact path="/signup" element={<SignUp />}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;

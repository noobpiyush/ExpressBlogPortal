import { Routes, Route } from 'react-router-dom'
import './App.css'
import Posts from './Posts'
import Header from "./Header";
import Layout from './Layout';
import IndexPage from './pages/IndexPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { UserContextProvider } from './UserContext';
import CreatePost from './pages/CreatePost';
import PostPage from './pages/PostPage';
import EditPost from './pages/EditPost';


function App() {
  return (
    <UserContextProvider>
      <Routes>
        <Route path="/" element={<Layout></Layout>} >
          <Route index element={<IndexPage></IndexPage>} ></Route>
          <Route path="/login" element={<LoginPage></LoginPage>} >
          </Route>
          <Route path='/register' element={<RegisterPage></RegisterPage>} ></Route>
          <Route path='/create' element={<CreatePost></CreatePost>} ></Route>
          <Route path='/post/:id' element={<PostPage></PostPage>} ></Route>
          <Route path='/edit/:id' element={<EditPost />} ></Route>
        </Route>
      </Routes>
    </UserContextProvider>
  )
}

export default App

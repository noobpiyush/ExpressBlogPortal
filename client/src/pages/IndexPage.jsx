import { useEffect, useState } from "react";
import Posts from "../Posts";


export default function IndexPage() {
    const [posts, setPosts] = useState([]);
    useEffect(function () {
        fetch("http://localhost:4000/post").then(response => {
            response.json().then(posts => {
                setPosts(posts);
            });
        });
    }, []);

    return (
        <>
            {posts.length > 0 && posts.map(post => ( <Posts {...post} ></Posts>))}
        </>
    )
}
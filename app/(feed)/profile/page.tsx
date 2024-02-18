"use client";
import { useEffect, useState } from "react";
import supabase from "@/utils/supabase";

import { Modal, Button, Input, List, Avatar, message } from "antd";
import { formatDistanceToNow } from "date-fns";

import {
  FaBookmark,
  FaHeart,
  FaRegBookmark,
  FaRegComment,
  FaRegHeart,
  FaRegPaperPlane,
  FaRegShareSquare,
} from "react-icons/fa";
import { IoPaperPlaneOutline } from "react-icons/io5";
import TimeAgo from "@/components/TimeAgo";
import MyPosts from "@/components/MyPosts";

interface Post {
  post_id: number;
  user_uid: string;
  photo_url: string;
  description: string;
  posted_at_time: string;
}

interface Comment {
  comment_id: number;
  user_id: string;
  post_id: number;
  comment_text: string;
  username: string;
  created_at: string;
}

const Profile: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [user, setUser] = useState<any>();
  const [userDetails, setUserDetails] = useState<any>();
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);

  const [tab, setTab] = useState("posts");

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      setUser(data.user);

      const { data: userData, error: err } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user?.id);

      if (userData && userData[0]) {
        setUserDetails(userData[0]);
      }
    };

    getUser();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("user_uid", user?.id);
      if (error) {
        console.error("Error fetching posts:", error.message);
        return;
      }

      const postsWithImages = await Promise.all(
        data?.map(async (post: Post) => {
          try {
            const { data: postDetails, error: userError } = await supabase
              .from("users")
              .select("*")
              .eq("id", post.user_uid);

            const { data: imageData, error: imageError } =
              await supabase.storage.from("images").download(post.photo_url);
            if (imageError) {
              console.error("Error downloading image:", imageError.message);
              return post;
            }
            const photoUrl = URL.createObjectURL(imageData);

            // Fetch the number of likes for the post
            const { data: likesData, error: likesError } = await supabase
              .from("likes")
              .select("user_id")
              .eq("post_id", post.post_id);
            const likesCount = likesData ? likesData.length : 0;

            const { data: commentsData, error: commentsError } = await supabase
              .from("comments")
              .select("*")
              .eq("post_id", post.post_id);
            const commentsCount = commentsData ? commentsData.length : 0;

            // Check if the user has liked the post
            const isLiked =
              likesData &&
              likesData.some((like: any) => like.user_id === user?.id);

            // Check if the user has saved the post
            const { data: savedData, error: savedError } = await supabase
              .from("saves")
              .select("save_id")
              .eq("post_id", post.post_id)
              .eq("user_id", user?.id);
            const isSaved = savedData && savedData.length > 0;

            return {
              ...post,
              photoUrl,
              postDetails,
              likesCount,
              commentsData,
              isLiked,
              isSaved,
            };
          } catch (error: any) {
            console.error("Error downloading image:", error.message);
            return post;
          }
        }) || []
      );

      setPosts(postsWithImages);
    };

    fetchPosts();
  }, [user]);

  const getFollowersCount = async () => {
    const { data, error } = await supabase
      .from("followers")
      .select("follower_id")
      .eq("user_id", user?.id);
    return data?.length || 0;
  };

  const getFollowingCount = async () => {
    const { data, error } = await supabase
      .from("followers")
      .select("user_id")
      .eq("follower_id", user?.id);
    return data?.length || 0;
  };

  useEffect(() => {
    getFollowersCount().then((count) => setFollowersCount(count));
    getFollowingCount().then((count) => setFollowingCount(count));
  }, [user]);

  return (
    <>
      <div className="w-full flex flex-col items-center justify-center">
        <div className="flex gap-4 md:ml-64 md:p-4 max-w-[500px]  flex-col">
          <div className="flex flex-col w-full px-4">
            <div className="flex items-center w-[400px] p-4 ">
              <img
                src={
                  "https://ik.imagekit.io/demo/tr:di-medium_cafe_B1iTdD0C.jpg/non_existent_image.jpg"
                }
                alt="User Avatar"
                className="w-20 h-20 rounded-full mr-4"
              />
              <div className="flex flex-col">
                <p className="font-bold">
                  {userDetails ? userDetails.username : "Unknown"}
                </p>
                <button className="bg-gray-100 my-2 text-black px-2 py-1 rounded-md">
                  Edit Profile
                </button>
              </div>
            </div>
            <div className="flex  flex-col  w-full ml-4">
              <p className="font-semibold">
                {" "}
                {userDetails ? userDetails.name : "Unknown"}
              </p>

              <p className="mr-4">
                {userDetails ? userDetails.bio : "Unknown"}
              </p>
            </div>
            <div className="flex items-center py-6 justify-around w-full ml-4">
              <p className="mr-4">
                <span className="font-bold">{posts.length}</span> posts
              </p>
              <p className="mr-4">
                <span className="font-bold">{followersCount}</span> followers
              </p>
              <p>
                <span className="font-bold">{followingCount}</span> following
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex w-full justify-center">
          <button
            onClick={() => setTab("posts")}
            className={`${
              tab === "posts"
                ? "border-b-2  border-black"
                : "border-b-2 border-transparent"
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setTab("saved")}
            className={`${
              tab === "saved"
                ? "border-b-2 border-black"
                : "border-b-2 border-transparent"
            }`}
          >
            Saved
          </button>
        </div>
      </div>
      {tab === "posts" && <MyPosts />}
    </>
  );
};

export default Profile;

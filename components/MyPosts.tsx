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

const MyPosts = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [user, setUser] = useState<any>();
  const [commentModalVisible, setCommentModalVisible] =
    useState<boolean>(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState<string>("");
  const [userDetails, setUserDetails] = useState<any>();

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      setUser(data.user);

      console.log("data", data.user?.id);

      const { data: userData, error: err } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user?.id);

      if (userData && userData[0]) {
        console.log("userDattaaa", userData[0]);
        setUserDetails(userData[0]);
      }
      setUserDetails(userData);
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

      console.log("data", data);

      const postsWithImages = await Promise.all(
        data?.map(async (post: Post) => {
          try {
            const { data: postDetails, error: userError } = await supabase
              .from("users")
              .select("*")
              .eq("id", post.user_uid);
            console.log("postDetails", postDetails);
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

  const handleLike = async (postId: number) => {
    try {
      const { data: likedData, error: likedError } = await supabase
        .from("likes")
        .select("like_id")
        .eq("post_id", postId)
        .eq("user_id", user.id);

      if (likedData && likedData.length > 0) {
        // User has already liked the post, so unlike
        const { error: unlikeError } = await supabase
          .from("likes")
          .delete()
          .eq("like_id", likedData[0].like_id);
        if (unlikeError) {
          console.error("Error unliking post:", unlikeError.message);
          return;
        }
      } else {
        // User has not liked the post, so like
        const { data: likeData, error: likeError } = await supabase
          .from("likes")
          .insert([{ user_id: user.id, post_id: postId }]);
        if (likeError) {
          console.error("Error liking post:", likeError.message);
          return;
        }
      }

      // Update the likes count and isLiked status for the post
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.post_id === postId
            ? {
                ...post,
                likesCount: post.isLiked
                  ? post.likesCount - 1
                  : post.likesCount + 1,
                isLiked: !post.isLiked,
              }
            : post
        )
      );
    } catch (error: any) {
      console.error("Error toggling like:", error.message);
    }
  };

  const handleSave = async (postId: number) => {
    try {
      const { data: savedData, error: savedError } = await supabase
        .from("saves")
        .select("save_id")
        .eq("post_id", postId)
        .eq("user_id", user.id);

      if (savedData && savedData.length > 0) {
        // User has already saved the post, so unsave
        const { error: unsaveError } = await supabase
          .from("saves")
          .delete()
          .eq("save_id", savedData[0].save_id);
        message.success("Post unsaved");
        if (unsaveError) {
          console.error("Error unsaving post:", unsaveError.message);
          return;
        }
      } else {
        // User has not saved the post, so save
        const { data: saveData, error: saveError } = await supabase
          .from("saves")
          .insert([{ user_id: user.id, post_id: postId }]);
        message.success("Post saved");
        if (saveError) {
          console.error("Error saving post:", saveError.message);
          return;
        }
      }

      // Update the isSaved status for the post
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.post_id === postId ? { ...post, isSaved: !post.isSaved } : post
        )
      );
    } catch (error: any) {
      console.error("Error toggling save:", error.message);
    }
  };

  const handleOpenCommentModal = async (postId: number) => {
    setSelectedPostId(postId);
    setCommentModalVisible(true);

    // Fetch comments for the selected post
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    if (error) {
      console.error("Error fetching comments:", error.message);
      return;
    }
    setComments(data || []);
  };

  const handleCloseCommentModal = () => {
    setSelectedPostId(null);
    setCommentModalVisible(false);
  };

  const handleAddComment = async () => {
    try {
      if (!commentText.trim()) {
        message.error("Please enter a comment");
        return;
      }

      const { data: commentData, error: commentError } = await supabase
        .from("comments")
        .insert([
          {
            user_id: user.id,
            post_id: selectedPostId,
            comment_text: commentText,
            username: userDetails[0].username,
          },
        ]);
      message.success("Comment Posted");
      if (commentError) {
        console.error("Error adding comment:", commentError.message);
        return;
      }

      // Fetch and update comments for the selected post
      const { data: newComments, error: fetchError } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", selectedPostId)
        .order("created_at", { ascending: true });
      if (fetchError) {
        console.error("Error fetching comments:", fetchError.message);
        return;
      }

      setComments(newComments || []);

      // Close the comment modal
      setCommentText("");
    } catch (error: any) {
      console.error("Error adding comment:", error.message);
    }
  };

  useEffect(() => {
    console.log("userDetails", userDetails && userDetails[0]);
  });

  const handleDeletePost = async (postId: number) => {
    try {
      const { error: deleteError } = await supabase
        .from("posts")
        .delete()
        .eq("post_id", postId);
      if (deleteError) {
        console.error("Error deleting post:", deleteError.message);
        return;
      }
      setPosts((prevPosts) =>
        prevPosts.filter((post) => post.post_id !== postId)
      );
    } catch (error: any) {
      console.error("Error deleting post:", error.message);
    }
  };

  return (
    <div className="w-full flex items-center justify-center">
      <div className="flex gap-4 md:ml-64 md:p-4 max-w-[500px]  flex-col">
        {posts.map((post) => (
          <div
            key={post.post_id}
            className="md:border md:rounded-lg overflow-hidden bg-white"
          >
            <div className="flex items-center p-4 ">
              <img
                src={
                  "https://ik.imagekit.io/demo/tr:di-medium_cafe_B1iTdD0C.jpg/non_existent_image.jpg"
                }
                alt="User Avatar"
                className="w-8 h-8 rounded-full mr-2"
              />
              <div className="flex flex-col">
                <p className="font-bold">
                  {post.postDetails ? post.postDetails[0].username : "Unknown"}
                </p>
              </div>
            </div>
            <img
              src={post.photoUrl}
              alt={post.description}
              className="w-full"
            />
            <div className="px-4 pt-4 md:pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center mb-2">
                  <button
                    onClick={() => handleLike(post.post_id)}
                    className="mr-4"
                  >
                    {post.isLiked ? (
                      <FaHeart className="text-red-500 text-xl" />
                    ) : (
                      <FaRegHeart className=" text-xl" />
                    )}
                  </button>
                  <button
                    onClick={() => handleOpenCommentModal(post.post_id)}
                    className="mr-4"
                  >
                    <FaRegComment className=" text-xl" />
                  </button>
                  <button>
                    <FaRegPaperPlane className="mr-4 text-xl" />
                  </button>
                </div>
                <div className="flex items-center mb-2">
                  <button onClick={() => handleSave(post.post_id)} className="">
                    {post.isSaved ? (
                      <FaBookmark className="text-xl" />
                    ) : (
                      <FaRegBookmark className="text-xl" />
                    )}
                  </button>
                </div>
              </div>

              <p className="text-sm">{post.likesCount} Like</p>

              <p className="font-medium text-sm">
                <span className="font-semibold">
                  {post.postDetails ? post.postDetails[0].username : "Unknown"}
                </span>{" "}
                {post.description}
              </p>
              <p
                onClick={() => handleOpenCommentModal(post.post_id)}
                className="text-[12px] text-gray-500 hover:underline cursor-pointer"
              >
                {post.commentsData.length}{" "}
                {post.commentsData.length === 1 ? "Comment" : "Comments"}
              </p>
              <p className="text-gray-500 text-[12px]">
                <TimeAgo postedAtTime={post.posted_at_time} />
              </p>
              {/* Comments section */}
            </div>
          </div>
        ))}

        {/* Comment Modal */}
        <Modal
          open={commentModalVisible}
          title="Comments"
          onCancel={handleCloseCommentModal}
          footer={[
            <Button key="cancel" onClick={handleCloseCommentModal}>
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={handleAddComment}
              className="bg-blue-600"
            >
              Add Comment
            </Button>,
          ]}
        >
          {comments && comments.length > 0 ? (
            <List
              itemLayout="horizontal"
              dataSource={comments}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    //  avatar={<Avatar src={item.userDetails?.avatar_url} />}
                    title={
                      <div className="flex flex-row justify-between">
                        <p>{item.username}</p>

                        <p className="text-gray-500 text-[12px]">
                          <TimeAgo postedAtTime={item.created_at} />
                        </p>
                      </div>
                    }
                    description={item.comment_text}
                  />
                </List.Item>
              )}
            />
          ) : (
            <p>No comments yet</p>
          )}

          <Input.TextArea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Enter your comment"
            autoSize={{ minRows: 3, maxRows: 5 }}
          />
        </Modal>
      </div>
    </div>
  );
};

export default MyPosts;

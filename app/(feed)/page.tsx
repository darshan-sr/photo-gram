'use client';
import { useEffect, useState } from 'react';
import supabase from '@/utils/supabase';

import { Modal, Button, Input, List, Avatar, message } from 'antd';

import { FaBookmark, FaHeart, FaRegBookmark, FaRegComment, FaRegHeart, FaRegShareSquare  } from "react-icons/fa";


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

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [user, setUser] = useState<any>();
  const [commentModalVisible, setCommentModalVisible] = useState<boolean>(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState<string>('');
  const [userDetails, setUserDetails ] = useState<any>();

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      setUser(data.user);

      console.log('data',data.user?.id)

      const { data: userData, error: err} = await supabase.from('users').select('*').eq('id', data.user?.id);
      console.log('userDattaaa',userData)
      setUserDetails(userData)
    };


    getUser();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase.from('posts').select('*');
      if (error) {
        console.error('Error fetching posts:', error.message);
        return;
      }

      const postsWithImages = await Promise.all(
        data?.map(async (post: Post) => {
          try {
            const { data: userDetails, error: userError } = await supabase.from('users').select('*').eq('id', post.user_uid);
            const { data: imageData, error: imageError } = await supabase.storage
              .from('images')
              .download(post.photo_url);
            if (imageError) {
              console.error('Error downloading image:', imageError.message);
              return post;
            }
            const photoUrl = URL.createObjectURL(imageData);

            // Fetch the number of likes for the post
            const { data: likesData, error: likesError } = await supabase
              .from('likes')
              .select('user_id')
              .eq('post_id', post.post_id);
            const likesCount = likesData ? likesData.length : 0;

            // Check if the user has liked the post
            const isLiked = likesData && likesData.some((like: any) => like.user_id === user?.id);

            // Check if the user has saved the post
            const { data: savedData, error: savedError } = await supabase
              .from('saves')
              .select('save_id')
              .eq('post_id', post.post_id)
              .eq('user_id', user?.id);
            const isSaved = savedData && savedData.length > 0;

            return { ...post, photoUrl, userDetails, likesCount, isLiked, isSaved };
          } catch (error: any) {
            console.error('Error downloading image:', error.message);
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
       .from('likes')
       .select('like_id')
       .eq('post_id', postId)
       .eq('user_id', user.id);
     
     if (likedData && likedData.length > 0) {
       // User has already liked the post, so unlike
       const { error: unlikeError } = await supabase
         .from('likes')
         .delete()
         .eq('like_id', likedData[0].like_id);
       if (unlikeError) {
         console.error('Error unliking post:', unlikeError.message);
         return;
       }
     } else {
       // User has not liked the post, so like
       const { data: likeData, error: likeError } = await supabase
         .from('likes')
         .insert([{ user_id: user.id, post_id: postId }]);
       if (likeError) {
         console.error('Error liking post:', likeError.message);
         return;
       }
     }

     // Update the likes count and isLiked status for the post
     setPosts((prevPosts) =>
       prevPosts.map((post) =>
         post.post_id === postId
           ? {
               ...post,
               likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1,
               isLiked: !post.isLiked,
             }
           : post
       )
     );
   } catch (error: any) {
     console.error('Error toggling like:', error.message);
   }
 };

 const handleSave = async (postId: number) => {
   try {
     const { data: savedData, error: savedError } = await supabase
       .from('saves')
       .select('save_id')
       .eq('post_id', postId)
       .eq('user_id', user.id);

     if (savedData && savedData.length > 0) {
       // User has already saved the post, so unsave
       const { error: unsaveError } = await supabase
         .from('saves')
         .delete()
         .eq('save_id', savedData[0].save_id);
       if (unsaveError) {
         console.error('Error unsaving post:', unsaveError.message);
         return;
       }
     } else {
       // User has not saved the post, so save
       const { data: saveData, error: saveError } = await supabase
         .from('saves')
         .insert([{ user_id: user.id, post_id: postId }]);
       if (saveError) {
         console.error('Error saving post:', saveError.message);
         return;
       }
     }

     // Update the isSaved status for the post
     setPosts((prevPosts) =>
       prevPosts.map((post) =>
         post.post_id === postId
           ? { ...post, isSaved: !post.isSaved }
           : post
       )
     );
   } catch (error: any) {
     console.error('Error toggling save:', error.message);
   }
 };

  const handleOpenCommentModal = async (postId: number) => {
    setSelectedPostId(postId);
    setCommentModalVisible(true);

    // Fetch comments for the selected post
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (error) {
      console.error('Error fetching comments:', error.message);
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
        message.error('Please enter a comment');
        return;
      }

      const { data: commentData, error: commentError } = await supabase
        .from('comments')
        .insert([{ user_id: user.id, post_id: selectedPostId, comment_text: commentText, username: userDetails[0].username }]);
      if (commentError) {
        console.error('Error adding comment:', commentError.message);
        return;
      }

      // Fetch and update comments for the selected post
      const { data: newComments, error: fetchError } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', selectedPostId)
        .order('created_at', { ascending: true });
      if (fetchError) {
        console.error('Error fetching comments:', fetchError.message);
        return;
      }

      setComments(newComments || []);

      // Close the comment modal
      setCommentText('');
    } catch (error: any) {
      console.error('Error adding comment:', error.message);
    }
  };

  return (
   <div className='w-full flex items-center justify-center'>
    <div className="flex gap-4 md:ml-64 p-4 max-w-[500px]  flex-col">
      {posts.map((post) => (
        <div key={post.post_id} className="border rounded-lg overflow-hidden bg-white">
          <div className="flex items-center p-4">
            <img src={'https://ik.imagekit.io/demo/tr:di-medium_cafe_B1iTdD0C.jpg/non_existent_image.jpg'} alt="User Avatar" className="w-8 h-8 rounded-full mr-2" />
            <div className="flex flex-col">
              <p className="font-bold">{post.userDetails ? post.userDetails[0].username : 'Unknown'}</p>
            </div>
          </div>
          <img src={post.photoUrl} alt={post.description} className="w-full" />
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center mb-2">
                <button onClick={() => handleLike(post.post_id)} className="mr-4">
                  {post.isLiked ? <FaHeart className="text-red-500" /> : <FaRegHeart className="text-gray-500" />}
                </button>
                <button onClick={() => handleOpenCommentModal(post.post_id)} className="mr-4">
                  <FaRegComment className="text-gray-500" />
                </button>
                <button>
                  <FaRegShareSquare className="mr-4" />
                </button>
              </div>
              <div className="flex items-center mb-2">
                <button onClick={() => handleSave(post.post_id)} className="mr-2">
                   {post.isSaved ? <FaBookmark /> : <FaRegBookmark />} 
                </button>
              </div>
            </div>

            <p className="text-sm">{post.likesCount} Like</p>

            <p className="font-medium text-sm">
              <span className="font-semibold">{post.userDetails[0].username}</span> {post.description}
            </p>
            <p className="text-gray-500 text-[12px]">Posted at {new Date(post.posted_at_time).toLocaleString()}</p>
            {/* Comments section */}
          </div>
        </div>
      ))}

      {/* Comment Modal */}
      <Modal
        visible={commentModalVisible}
        title="Comments"
        onCancel={handleCloseCommentModal}
        footer={[
          <Button key="cancel" onClick={handleCloseCommentModal}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleAddComment}>
            Add Comment
          </Button>,
        ]}
      >
        <List
          itemLayout="horizontal"
          dataSource={comments}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
               //  avatar={<Avatar src={item.userDetails?.avatar_url} />}
                title={<p>{item.username}</p>}
                description={item.comment_text}
              />
            </List.Item>
          )}
        />
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

export default Feed;

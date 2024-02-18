"use client";
import React, { useEffect, useState } from "react";
import supabase from "@/utils/supabase";
import { useRouter } from "next/navigation";
import { Modal, Input, message } from "antd";
import { get } from "http";
import MyPosts from "@/components/MyPosts";

interface Post {
  post_id: number;
  user_uid: string;
  photo_url: string;
  description: string;
  posted_at_time: string;
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<any>();
  const [userDetails, setUserDetails] = useState<any>();
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [postsCount, setPostsCount] = useState<number>(0);

  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      setUser(data.user);

      if (!data.user) {
        router.push("/auth/login");
      }

      const { data: userData, error: err } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user?.id);

      if (userData && userData[0]) {
        setUserDetails(userData[0]);
        setEditName(userData[0].name);
        setEditBio(userData[0].bio);
      }
    };

    getUser();
  }, []);

  const handleEditProfile = async () => {
    const { data, error } = await supabase
      .from("users")
      .update({ name: editName, bio: editBio })
      .eq("id", user?.id);

    if (error) {
      message.error("Failed to update profile");
    } else {
      message.success("Profile updated successfully");
      setEditModalVisible(false);
      setUserDetails({ ...userDetails, name: editName, bio: editBio });
    }
  };

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

  const getPostsCount = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("post_id")
      .eq("user_uid", user?.id);
    return data?.length || 0;
  };

  useEffect(() => {
    getFollowersCount().then((count) => setFollowersCount(count));
    getFollowingCount().then((count) => setFollowingCount(count));
    getPostsCount().then((count) => setPostsCount(count));
  }, [user]);

  return (
    <>
      <div className="w-full flex flex-col items-center justify-center">
        <div className="flex gap-4 md:ml-64 md:p-4 max-w-[500px]  flex-col">
          <div className="flex flex-col w-full px-4">
            <div className="flex items-center w-[400px] p-4 ">
              <img
                src="https://raw.githubusercontent.com/darshan-sr/edustack-rvitm/main/public/None.jpg?token=GHSAT0AAAAAACJ4DQILACN3WADMUCF432CGZOSL2GA"
                alt="User Avatar"
                className="w-20 h-20 rounded-full mr-4"
              />
              <div className="flex flex-col">
                <p className="font-bold">
                  {userDetails ? userDetails.username : "Unknown"}
                </p>
                <button
                  onClick={() => setEditModalVisible(true)}
                  className="bg-gray-100 my-2 text-black px-2 py-1 rounded-md"
                >
                  Edit Profile
                </button>
              </div>
            </div>
            <div className="flex  flex-col  w-full ml-4">
              <p className="font-semibold">
                {userDetails ? userDetails.name : "Unknown"}
              </p>

              <p className="mr-4">
                {userDetails ? userDetails.bio : "Unknown"}
              </p>
              <div className="flex flex-row justify-between my-4">
                <p className="mr-4">
                  <span className="font-bold">{postsCount}</span> posts
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
      </div>
      <div>
        <MyPosts />
      </div>

      <Modal
        title="Edit Profile"
        open={editModalVisible}
        onOk={handleEditProfile}
        onCancel={() => setEditModalVisible(false)}
      >
        <label htmlFor="name" className="">
          name
        </label>
        <Input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          placeholder="Name"
          className="mb-4"
        />
        <label htmlFor="bio" className="">
          Bio
        </label>
        <Input.TextArea
          value={editBio}
          onChange={(e) => setEditBio(e.target.value)}
          placeholder="Bio"
        />
      </Modal>
    </>
  );
};

export default Profile;

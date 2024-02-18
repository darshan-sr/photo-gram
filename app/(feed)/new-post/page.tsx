'use client';
import { useState } from 'react';
import { message } from 'antd';
import supabase from '@/utils/supabase';


const NewPostPage = () => {
 
  const [photo, setPhoto] = useState<File | null>(null);
  const [postTitle, setPostTitle] = useState<string>('');

  const handleUpload = async (e: any) => {
    e.preventDefault();
    try {
      if (!photo) {
        message.error('Please select a photo');
        return;
      }
       
      const {data: userData, error } = await supabase.auth.getUser();

      const filePath = `photo-${Math.random()}-id${photo.name.split('.').pop()}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, photo);

      if (uploadError) {
        console.log(uploadError);
        return;
      }

        const {  error: postError } = await supabase
          .from('posts')
          .upsert([{
            user_uid: userData.user?.id, // Replace with the user's UID
            photo_url: uploadData.path ,
            description: postTitle,
            posted_at_time: new Date().toISOString(),
           
          }]);
       
        

        if (postError) {
          message.error('Failed to save post');
          return;
        }

        message.success('Post created successfully');
      


     
    } catch (error: any) {
      console.error('Error:', error.message);
    }
  };

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setPhoto(file);
    }
  };

  return (
<section className="bg-white dark:bg-gray-900">
  <div className="py-8 px-4 mx-auto max-w-2xl lg:py-16">
      <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Create new post</h2>
      <form action="#">
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
              <div className="sm:col-span-2">
                  <label  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Post Title</label>
                  <input onChange={(e) => setPostTitle(e.target.value)} value={postTitle} type="text" name="name" id="name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-primary-500" placeholder="Enter post title" required />
              </div>

       
         
              <div className="flex items-center justify-center w-full">
  {photo ? (
    <div className="relative">
      <img src={URL.createObjectURL(photo as Blob)} className="w-full h-64 object-cover rounded-lg" alt="Uploaded" />
      <button className="absolute top-2 right-2 bg-white dark:bg-gray-800 p-1 rounded-full" onClick={() => setPhoto(null)}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  ) : (
    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
      <div className="flex flex-col items-center justify-center pt-5 pb-6">
        <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
        </svg>
        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
      </div>
      <input id="dropzone-file" onChange={handlePhotoChange} type="file" className="hidden" />
    </label>
  )}
</div>


  
   
          </div>
          <button type="submit" onClick={handleUpload} className="inline-flex items-center px-5 py-2.5 mt-4 sm:mt-6 text-sm font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800">
              Post
          </button>
      </form>
  </div>
</section>
  );
};

export default NewPostPage;

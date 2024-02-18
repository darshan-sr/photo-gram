"use client";

import { useState } from 'react';
import { Button, Modal, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import supabase from '@/utils/supabase';
const PostComponent = () => {
  const [visible, setVisible] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]); // Use correct type for file list

  const handleUpload = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('your_bucket_name') // Replace with your bucket name
        .upload('file_path', fileList[0].originFileObj); // Replace with your file path
      if (error) {
        message.error('Failed to upload file');
        return;
      }
      message.success('File uploaded successfully');
      // Handle uploaded file data as needed (e.g., save URL to database)
    } catch (error: any) {
      console.error('Upload error:', error.message);
    }
  };

  const handleChange = (info: any) => {
    let fileList = [...info.fileList];
    fileList = fileList.slice(-1); // Allow only one file to be uploaded
    setFileList(fileList);
  };

  return (
    <div className='flex flex-row items-center justify-center w-full min-h-screen'>
      <button  onClick={() => setVisible(true)}>
        Create Post
      </button>
      <Modal
        title="Create Post"
        visible={visible}
        onCancel={() => setVisible(false)}
        onOk={handleUpload}
      >
        <Upload
          fileList={fileList}
          onChange={handleChange}
          beforeUpload={() => false} // Prevent default upload behavior
        >
          <Button icon={<UploadOutlined />}>Upload Photo</Button>
        </Upload>
        {/* Add other fields for post content (e.g., text area for description) */}
      </Modal>
    </div>
  );
};

export default PostComponent;

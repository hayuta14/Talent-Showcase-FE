'use client';

import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon, PhotoIcon, FaceSmileIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface PostContent {
  content: string;
  image?: File;
}

export default function UpContent() {
  const [isOpen, setIsOpen] = useState(false);
  const [postData, setPostData] = useState<PostContent>({
    content: '',
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPostData({ ...postData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement your post submission logic here
    console.log('Post data:', postData);
    setIsOpen(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-black hover:bg-gray-900 text-white px-4 py-3 rounded-full transition-colors font-semibold"
      >
        Post
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setIsOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-10" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                  <div className="p-4 border-b">
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => setIsOpen(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                      <button
                        onClick={handleSubmit}
                        className="bg-black text-white px-4 py-1.5 rounded-full font-semibold hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!postData.content.trim()}
                      >
                        Post
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="p-4">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0">
                        {/* Add user avatar here */}
                      </div>
                      <div className="flex-1">
                        <textarea
                          value={postData.content}
                          onChange={(e) =>
                            setPostData({ ...postData, content: e.target.value })
                          }
                          placeholder="What's happening?"
                          className="w-full resize-none border-none focus:ring-0 text-lg placeholder-gray-500"
                          rows={3}
                        />
                        
                        {previewImage && (
                          <div className="relative mt-4 rounded-xl overflow-hidden">
                            <img
                              src={previewImage}
                              alt="Preview"
                              className="max-h-96 w-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewImage(null);
                                setPostData({ ...postData, image: undefined });
                              }}
                              className="absolute top-2 left-2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70"
                            >
                              <XMarkIcon className="h-5 w-5" />
                            </button>
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-4 pt-4 border-t">
                          <div className="flex gap-2">
                            <label className="cursor-pointer text-blue-500 hover:text-blue-600">
                              <PhotoIcon className="h-6 w-6" />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                              />
                            </label>
                            <button
                              type="button"
                              className="text-blue-500 hover:text-blue-600"
                            >
                              <FaceSmileIcon className="h-6 w-6" />
                            </button>
                          </div>
                          <div className="text-sm text-gray-500">
                            {postData.content.length}/280
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}

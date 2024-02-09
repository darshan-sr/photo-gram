'use client';
import React, { useState } from 'react'
import supabase from '@/utils/supabase'
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const LoginPage = () => {

  const [email, setEmail ] = useState("");
  const [password, setPassword ] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    const {data, error} = await supabase.auth.signUp({
      email,password
    })

    if(error) setError(error.message);

    console.log("loginError",error)

    if(data.user){
      const { data: loginData, error: loginError }  = await supabase.auth.signInWithPassword({
            email,password
        })
      if(loginData) router.push('/')
      console.log("loginError", loginError)
    }


  }
  return (
    <section className="bg-gray-50 dark:bg-gray-900">
    <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <a href="#" className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
            <img className="w-8 h-8 mr-2" src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg" alt="logo"/>
            Photogram    
        </a>
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                    Sign up to your account
                </h1>
                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6" action="#">
                    <div>
                        <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
                        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" name="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="name@company.com" required/>
                    </div>
                    <div>
                        <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Choose Password</label>
                        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" name="password" id="password" placeholder="••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required/>
                    </div>

                    {error && (
                      <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                     {error}
                    </div>
                    )}
                    <button type="submit"  className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Sign Up</button>
                    <p className="text-sm w-fulll items-center jus font-light text-gray-500 dark:text-gray-400">
                        Back to <Link href="/auth/login" className="font-medium text-blue-600 hover:underline dark:text-blue-500">Sign In</Link>
                    </p>
                </form>
            </div>
        </div>
    </div>
  </section>
  )
}

export default LoginPage

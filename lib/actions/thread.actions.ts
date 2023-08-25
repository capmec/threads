'use server'

import { revalidatePath } from 'next/cache'

import { connectToDB } from '../mongoose'

import Thread from '../models/thread.model'
import User from '../models/user.model'

interface Params {
    text: string
    author: string
    communityId: string | null
    path: string
}

export async function createThread({
    text,
    author,
    communityId,
    path,
}: Params) {
    try {
        connectToDB()

        const createThread = await Thread.create({
            text,
            author,
            community: null,
        })

        //Update userModel
        //Update communityModel
        await User.findByIdAndUpdate(author, {
            $push: { threads: createThread._id },
        })

        revalidatePath(path)
    } catch (error: any) {
        throw new Error(`Failed to create thread: ${error.message}`)
    }
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
    connectToDB()

    //Calculate the number of posts to skip
    const skipAmount = (pageNumber - 1) * pageSize

    //Fetch the posts that have no parents (top-level threads...)
    const postsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
        .sort({ createdAt: 'desc' })
        .skip(skipAmount)
        .limit(pageSize)
        .populate({ path: 'author', model: User })
        .populate({
            path: 'children',
            populate: {
                path: 'author',
                model: User,
                select: '_id name parentID image',
            },
        })

    //Fetch the total number of posts
    const totalPostsCount = await Thread.countDocuments({
        parentId: { $in: [null, undefined] },
    })

    const posts = await postsQuery.exec()

    const isNext = totalPostsCount > skipAmount + posts.length

    return { posts, isNext }
}

export async function fetchThreadById(id: string) {
    connectToDB()

    try {
        //TODO: Populate community

        const thread = await Thread.findById(id)
            .populate({
                path: 'author',
                model: User,
                select: '_id id name image',
            })
            .populate({
                path: 'children',
                populate: [
                    {
                        path: 'author',
                        model: User,
                        select: '_id id name parentId image',
                    },
                    {
                        path: 'children',
                        model: Thread,
                        populate: {
                            path: 'author',
                            model: User,
                            select: '_id id name parentId image',
                        },
                    },
                ],
            })
            .exec()
        return thread
    } catch (error: any) {
        throw new Error(`Failed to fetch thread: ${error.message}`)
    }
}

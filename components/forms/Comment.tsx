'use client'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { addCommentToThread } from '@/lib/actions/thread.actions'
import { CommentValidation } from '@/lib/validations/thread'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

interface Props {
    threadId: string
    currentUserImg: string
    currentUserId: string
}

const Comment = ({ threadId, currentUserImg, currentUserId }: Props) => {
    const router = useRouter()
    const pathname = usePathname()

    const form = useForm({
        resolver: zodResolver(CommentValidation),
        defaultValues: {
            thread: '',
        },
    })

    const onSubmit = async (values: z.infer<typeof CommentValidation>) => {
        await addCommentToThread(
            threadId,
            values.thread,
            JSON.parse(currentUserId),
            pathname,
        )

        form.reset()
    }
    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='comment-form'
            >
                <FormField
                    control={form.control}
                    name='thread'
                    render={({ field }) => {
                        return (
                            <FormItem className='flex w-full items-center gap-3'>
                                <FormLabel>
                                    <Image
                                        src={currentUserImg}
                                        alt='Profile image'
                                        width={48}
                                        height={48}
                                        className='rounded-full object-cover'
                                    />
                                </FormLabel>
                                <FormControl className='border-none bg-transparent'>
                                    <Input
                                        type='text'
                                        {...field}
                                        placeholder='Comment...'
                                        className='no-focus text-light-1 outline-none'
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )
                    }}
                />
                <Button type='submit' className='comment-form_btn'>
                    Reply
                </Button>
            </form>
        </Form>
    )
}

export default Comment

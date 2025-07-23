import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { useProgramState } from '@/hooks/useProgram'

export default function CreatePostModal({createPostModalOpen, setCreatePostModalOpen }) {
    const [title, setTitle] = useState('')
    const [image, setImage] = useState('')
    const [description, setDescription] = useState('')
    const [price, setPrice] = useState('')
    const [available, setAvailable] = useState('')
    const [priceOffer, setPriceOffer] = useState('')

    const {
        createPost
    } = useProgramState()

    const closeModal = () => {
        setCreatePostModalOpen(false)
    }

    const onCreate = (e) => {
        e.preventDefault()

        createPost(
          title,
          image,
          description,
          price,
          priceOffer,
          available
        )

        closeModal()
    }

    return (
        <Transition appear show={createPostModalOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={closeModal}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                                    Create Post
                                </Dialog.Title>

                                <div className="mt-2">
                                    <div className="grid grid-cols-1 gap-3">
                                        <label className="flex flex-col border rounded-lg px-3 py-2" htmlFor="location">
                                            <span className="text-xs font-light">title</span>
                                            <input onChange={(e) => setTitle(e.target.value)} className="outline-none bg-transparent text-sm pt-1" type="text" id="location" name="location" />
                                        </label>

                                        <label className="flex flex-col border rounded-lg px-3 py-2" htmlFor="imageURL">
                                            <span className="text-xs font-light">Image URL</span>
                                            <input onChange={(e) => setImage(e.target.value)} className="outline-none bg-transparent text-sm pt-1" type="text" id="imageURL" name="imageURL" />
                                        </label>

                                        <label className="flex flex-col border rounded-lg px-3 py-2" htmlFor="imageURL">
                                            <span className="text-xs font-light">Description</span>
                                            <input onChange={(e) => setDescription(e.target.value)} className="outline-none bg-transparent text-sm pt-1" type="text" id="imageURL" name="imageURL" />
                                        </label>

                                        <label className="flex flex-col border rounded-lg px-3 py-2" htmlFor="imageURL">
                                            <span className="text-xs font-light">Price $</span>
                                            <input onChange={(e) => setPrice(e.target.value)} className="outline-none bg-transparent text-sm pt-1" type="text" id="imageURL" name="imageURL" />
                                        </label>

                                        <label className="flex flex-col border rounded-lg px-3 py-2" htmlFor="imageURL">
                                            <span className="text-xs font-light">PriceOffer $</span>
                                            <input onChange={(e) => setPriceOffer(e.target.value)} className="outline-none bg-transparent text-sm pt-1" type="text" id="imageURL" name="imageURL" />
                                        </label>

                                        <label className="flex flex-col border rounded-lg px-3 py-2" htmlFor="imageURL">
                                            <span className="text-xs font-light">Available?? </span>
                                            <input onChange={(e) => setAvailable(e.target.value)} className="outline-none bg-transparent text-sm pt-1" type="text" id="imageURL" name="imageURL" />
                                        </label>
                                    </div>

                                    <div className="mt-4 flex justify-end">
                                        <button onClick={onCreate} type="button" className="border rounded-lg px-4 py-2 text-sm font-medium">
                                            Create
                                        </button>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { useProgramState } from "@/hooks/useProgram";

export default function CreateUserModal({
  createUserModalOpen,
  setCreateUserModalOpen,
}) {
  const [first_name, setFirst_name] = useState("");
  const [second_name, setSecond_name] = useState("");
  const [first_last_name, setFirst_last_name] = useState("");
  const [second_last_name, setSecond_last_name] = useState("");
  const [device_id, setDevice_id] = useState("");

  const { createUser } = useProgramState();

  const closeModal = () => {
    setCreateUserModalOpen(false);
  };

  const onCreate = (e) => {
    e.preventDefault();

    createUser(first_name, second_name,first_last_name,second_last_name,device_id);

    closeModal();
  };

  return (
    <Transition appear show={createUserModalOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Create User
                </Dialog.Title>

                <div className="mt-2">
                  <div className="grid grid-cols-1 gap-3">
                    <label
                      className="flex flex-col border rounded-lg px-3 py-2"
                      htmlFor="first_name"
                    >
                      <span className="text-xs font-light">setFirst_name</span>
                      <input
                        onChange={(e) => setFirst_name(e.target.value)}
                        className="outline-none bg-transparent text-sm pt-1"
                        type="text"
                        id="first_name"
                        name="first_name"
                      />
                    </label>

                    <label
                      className="flex flex-col border rounded-lg px-3 py-2"
                      htmlFor="second_name"
                    >
                      <span className="text-xs font-light">second_name</span>
                      <input
                        onChange={(e) => setSecond_name(e.target.value)}
                        className="outline-none bg-transparent text-sm pt-1"
                        type="text"
                        id="second_name"
                        name="second_name"
                      />
                    </label>

                    <label
                      className="flex flex-col border rounded-lg px-3 py-2"
                      htmlFor="first_last_name"
                    >
                      <span className="text-xs font-light">first_last_name</span>
                      <input
                        onChange={(e) => setFirst_last_name(e.target.value)}
                        className="outline-none bg-transparent text-sm pt-1"
                        type="text"
                        id="first_last_name"
                        name="first_last_name"
                      />
                    </label>

                    <label
                      className="flex flex-col border rounded-lg px-3 py-2"
                      htmlFor="second_last_name"
                    >
                      <span className="text-xs font-light">second_last_name</span>
                      <input
                        onChange={(e) => setSecond_last_name(e.target.value)}
                        className="outline-none bg-transparent text-sm pt-1"
                        type="text"
                        id="second_last_name"
                        name="first_last_name"
                      />
                    </label>

                    <label
                      className="flex flex-col border rounded-lg px-3 py-2"
                      htmlFor="device_id"
                    >
                      <span className="text-xs font-light">device_id</span>
                      <input
                        onChange={(e) => setDevice_id(e.target.value)}
                        className="outline-none bg-transparent text-sm pt-1"
                        type="text"
                        id="device_id"
                        name="device_id"
                      />
                    </label>

                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={onCreate}
                      type="button"
                      className="border rounded-lg px-4 py-2 text-sm font-medium"
                    >
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
  );
}

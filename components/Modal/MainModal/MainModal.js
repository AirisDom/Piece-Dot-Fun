import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { useProgramState } from "@/hooks/useProgram";
import styles from "./MainModal.module.scss";
import {IoClose} from "react-icons/io5"

export default function MainModal(props) {
  const { show, setShow, title, children, ...rest } = props;

  const onClose = () => setShow(false);

  return (
    <Transition appear show={show} as={Fragment}>
      <Dialog
        as="div"
        className={styles.mainModal_transition}
        onClose={onClose}
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
          <div />
        </Transition.Child>

        <div className={styles.mainModal_wrapper}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className={styles.mainModal_panel}>
              <div className={styles.mainModal_panel_header}>
              <Dialog.Title as="h3" className={styles.mainModal_title}>
                {title}
              </Dialog.Title>
              <IoClose onClick={onClose} size={30} className={styles.mainModal_panel_header_close}/>
              </div>
              <hr></hr>
              {children}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

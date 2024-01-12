import Image from "next/image";
import { useRef } from "react";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import intros from '../index.json';
import BasicButton from '@/pages/components/common/BasicButton';
import { Modal, ModalBody, ModalContent, useDisclosure } from '@nextui-org/react';
import PageDesc from '@/pages/components/common/PageDesc';
import circelImg from 'img/astrark/school/circel.png';
import arrowBackImg from 'img/astrark/school/arrow_back.png';

interface Props {
  activeIndex: number;
}

export default function SchoolStory(props: Props) {
  const { activeIndex } = props;
  const nodeRef = useRef<HTMLDivElement>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const schools = [
    {
      name: 'genetic',
      fullname: 'Livielt',
      homeplanet: 'zenith',
    },
    {
      name: 'mechanoid',
      fullname: 'Mechanical Technician',
      homeplanet: 'hyperborea',
    },
    {
      name: 'spiritual',
      fullname: 'God Whisperer',
      homeplanet: 'aeon',
    },
    {
      name: 'natural',
      fullname: 'Strangler',
      homeplanet: 'aurora',
    },
  ];

  return (
    <>
      <SwitchTransition mode="out-in">
        <CSSTransition classNames="desc" nodeRef={nodeRef} key={activeIndex} timeout={800} unmountOnExit>
          {() => (
            <div
              ref={nodeRef}
              className="desc uppercase absolute w-[41.25rem] h-[21.875rem] left-[18.75%] top-[27.25%] border-[#F4C699] border-l-[3px] px-[2.625rem] pt-[2.625rem] pb-[3rem] box-border max-md:hidden z-20"
            >
              <div className="flex items-center">
                <div className="w-[3.875rem] h-[3.875rem] relative">
                  <Image
                    className="object-cover"
                    src={`/img/astrark/school/${schools[activeIndex].name}.png`}
                    alt=""
                    fill
                  />
                </div>

                <div className="h-12 uppercase text-5xl font-semakin ml-[0.625rem] leading-[3.875rem]">
                  {schools[activeIndex].name}
                </div>
              </div>

              <div className="font-semakin text-2xl text-basic-yellow mt-3">
                Home Planet : {schools[activeIndex].homeplanet}
              </div>

              <div className="normal-case line-clamp-3 mt-[1.875rem] max-w-[29rem]">
                {(intros as any)[schools[activeIndex].name]}
              </div>

              <BasicButton className="mt-[1.875rem]" label="View More" onClick={onOpen} />
            </div>
          )}
        </CSSTransition>
      </SwitchTransition>

      <Modal
        size="full"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        motionProps={{
          variants: {
            enter: {
              x: 0,
              opacity: 1,
              transition: {
                duration: 0.3,
                ease: 'easeOut',
              },
            },
            exit: {
              x: -100,
              opacity: 0,
              transition: {
                duration: 0.2,
                ease: 'easeIn',
              },
            },
          },
        }}
        classNames={{
          base: 'left-0 top-0 max-w-[50vw] bg-transparent h-screen pr-[1.875rem] shadow-none',
          wrapper: 'justify-start',
          body: 'bg-black pt-60 pl-[14.3%] pr-[12%] overflow-y-auto shadow-small',
          closeButton:
            'right-0 top-1/2 -translate-y-1/2 w-[3.75rem] h-[3.75rem] z-10 hover:bg-transparent active:bg-transparent',
        }}
        closeButton={
          <div>
            <Image src={circelImg} alt="" fill />

            <Image
              className="w-3 h-4 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              src={arrowBackImg}
              alt=""
            />
          </div>
        }
      >
        <ModalContent>
          {(onClose) => (
            <ModalBody>
              <PageDesc
                hasBelt
                className="items-start max-w-[44.5rem] pl-3"
                title={
                  <div className="font-semakin mb-12">
                    <div className="text-5xl">{schools[activeIndex].fullname}</div>
                    <div className="text-2xl text-basic-yellow mt-5">
                      Home Planet : {schools[activeIndex].homeplanet}
                    </div>
                  </div>
                }
                subtitle={(intros as any)[schools[activeIndex].name]}
              />
            </ModalBody>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

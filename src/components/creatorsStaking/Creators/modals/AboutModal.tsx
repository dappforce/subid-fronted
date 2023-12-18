import { useCreatorSpaceById } from 'src/rtk/features/creatorStaking/creatorsSpaces/creatorsSpacesHooks'
import Modal from '../../tailwind-components/Modal'
import StakeActionButtons from '../StakeActionButtons'
import StakingModal, { StakingModalVariant } from './StakeModal'
import { useState } from 'react'
import AccountPreview from '../AccountPreview'
import MoveStakeModal from './MoveStakeModal'
import { useRouter } from 'next/router'

type AboutModalProps = {
  open: boolean
  closeModal: () => void
  spaceId: string
  isStake: boolean
  amount?: string
  setAmount: (amount: string) => void
}

const AboutModal = ({
  open,
  closeModal,
  spaceId,
  isStake,
  amount,
  setAmount,
}: AboutModalProps) => {
  const creatorSpaceEntity = useCreatorSpaceById(spaceId)

  const [ openStakeModal, setOpenStakeModal ] = useState(false)
  const [ modalVariant, setModalVariant ] = useState<StakingModalVariant>('stake')
  const [ openMoveStakeModal, setOpenMoveStakeModal ] = useState(false)
  const router = useRouter()

  const { space } = creatorSpaceEntity || {}

  const { about } = space || {}

  return (
    <>
      <Modal
        key={'about-modal'}
        isOpen={open}
        withFooter={false}
        title={'ℹ️ About'}
        withCloseButton
        closeModal={() => {
          const query = router.query

          if (query.creator) {
            delete query.creator
          }

          router.replace(
            {
              pathname: '/creators',
              query,
            },
            undefined,
            { scroll: false }
          )

          closeModal()
        }}
      >
        <div className='flex flex-col md:gap-6 gap-4'>
          <AccountPreview spaceId={spaceId} space={space} />

          {about && (
            <div className='flex flex-col gap-1 p-4 bg-gray-50 rounded-2xl'>
              <div className='text-text-muted text-sm'>Description</div>
              <div className='max-h-48 overflow-y-auto text-base'>{about}</div>
            </div>
          )}

          <StakeActionButtons
            spaceId={spaceId}
            isStake={isStake}
            buttonsSize='lg'
            openStakeModal={() => setOpenStakeModal(true)}
            openMoveStakeModal={() => setOpenMoveStakeModal(true)}
            setModalVariant={setModalVariant}
            onClick={() => closeModal()}
            className='text-base'
          />
        </div>
      </Modal>
      <StakingModal
        open={openStakeModal}
        closeModal={() => setOpenStakeModal(false)}
        spaceId={spaceId}
        modalVariant={modalVariant}
        eventSource='about-modal'
        amount={amount}
        setAmount={setAmount}
      />
      <MoveStakeModal
        open={openMoveStakeModal}
        closeModal={() => setOpenMoveStakeModal(false)}
        defaultCreatorFrom={spaceId}
      />
    </>
  )
}

export default AboutModal

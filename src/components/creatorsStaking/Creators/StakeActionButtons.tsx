import { useStakingConsts } from 'src/rtk/features/creatorStaking/stakingConsts/stakingConstsHooks'
import Button from '../tailwind-components/Button'
import { StakingModalVariant } from './modals/StakeModal'
import {
  useIsMulti,
  useMyAddress,
} from 'src/components/providers/MyExtensionAccountsContext'
import { useBackerInfo } from 'src/rtk/features/creatorStaking/backerInfo/backerInfoHooks'
import { Tooltip } from 'antd'
import clsx from 'clsx'

type StakeButtonProps = {
  spaceId: string
  isStake: boolean
  buttonsSize?: 'sm' | 'lg' | 'md'
  openModal: () => void
  setModalVariant: (variant: StakingModalVariant) => void
  onClick?: () => void
  className?: string
}

const StakeActionButtons = ({
  spaceId,
  isStake,
  buttonsSize = 'sm',
  openModal,
  setModalVariant,
  onClick,
  className,
}: StakeButtonProps) => {
  const myAddress = useMyAddress()
  const stakingConsts = useStakingConsts()
  const backerInfo = useBackerInfo(spaceId, myAddress || '')
  const isMulti = useIsMulti()

  const { info } = backerInfo || {}

  const { stakes } = info || {}

  const { maxEraStakeValues } = stakingConsts || {}

  const label = !isStake && myAddress ? 'Increase Stake' : 'Stake'

  const onButtonClick = (modalVariant: StakingModalVariant) => {
    onClick?.()
    setModalVariant(modalVariant)
    openModal()
  }

  const disableButtons =
    !myAddress ||
    !maxEraStakeValues ||
    !stakes ||
    stakes.length >= parseInt(maxEraStakeValues) - 1

  const buttons = (
    <div className='flex gap-4 md:flex-row flex-col'>
      <Button
        onClick={() => onButtonClick(isStake ? 'stake' : 'increaseStake')}
        variant='primaryOutline'
        className={clsx('w-full', className)}
        size={buttonsSize}
        disabled={disableButtons}
      >
        {label}
      </Button>
      {!isStake && myAddress && (
        <Button
          variant='outlined'
          className={clsx('w-full', className)}
          size={buttonsSize}
          onClick={() => onButtonClick('unstake')}
          disabled={disableButtons}
        >
          Unstake
        </Button>
      )}
    </div>
  )

  const multiAccountButton = (
    <Tooltip title={'Switch to single account mode'}>
      <div>
        <Button
          variant='primaryOutline'
          className={clsx('w-full', className)}
          size={buttonsSize}
          disabled={true}
        >
          Stake
        </Button>
      </div>
    </Tooltip>
  )

  const tooltipText = !myAddress
    ? 'Connect your wallet'
    : 'Claim your rewards first'

  const actionButtons = disableButtons ? (
    <Tooltip title={tooltipText}>{buttons}</Tooltip>
  ) : (
    buttons
  )

  return isMulti ? multiAccountButton : actionButtons
}

export default StakeActionButtons

import styles from './Transactions.module.sass'
import {
  Address,
  AccountPreview,
  AvatarOrSkeleton,
  getPrice,
} from '../../table/utils'
import { MutedDiv } from '../../utils/MutedText'
import { HiOutlineExternalLink } from 'react-icons/hi'
import clsx from 'clsx'
import { Transaction } from '../types'
import { toGenericAccountId } from '@/rtk/app/util'
import { usePrices } from '@/rtk/features/prices/pricesHooks'
import { useGetChainDataByNetwork } from '@/components/utils/useGetDecimalsAndSymbolByNetwork'
import { FormatBalance } from '@/components/common/balances'
import { convertToBalanceWithDecimal } from '@subsocial/utils'
import { BalanceView } from '../../homePage/address-views/utils/index'
import { ExternalLink } from '../../identity/utils'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import BN from 'bignumber.js'
import { useResponsiveSize } from '@/components/responsive'
import useGetProfileName from '@/hooks/useGetProfileName'
import { AvatarSize } from 'antd/lib/avatar/SizeContext'
import SentIcon from '@/assets/icons/sent.svg'
import RecievedIcon from '@/assets/icons/received.svg'
import { Divider } from 'antd'
import Link from 'next/link'

dayjs.extend(utc)

const subscanLinksByNetwork: Record<string, string> = {
  polkadot: 'https://polkadot.subscan.io/extrinsic/',
  kusama: 'https://kusama.subscan.io/extrinsic/',
  astar: 'https://astar.subscan.io/extrinsic/',
  moonbeam: 'https://moonbeam.subscan.io/extrinsic/',
  moonriver: 'https://moonriver.subscan.io/extrinsic/',
  subsocial: 'https://calamar.app/search?network=subsocial&query=',
}

type TransferRowProps = {
  item: Transaction
  isLastElement?: boolean
}

export const TransferRow = ({ item, isLastElement }: TransferRowProps) => {
  const { isMobile } = useResponsiveSize()
  const prices = usePrices()
  const {
    txKind,
    amount,
    senderOrTargetPublicKey,
    blockchainTag,
    transaction,
  } = item

  const { decimal, tokenSymbol, icon } = useGetChainDataByNetwork(
    blockchainTag.toLowerCase()
  )

  const address = toGenericAccountId(senderOrTargetPublicKey)

  const balanceWithDecimals = convertToBalanceWithDecimal(amount, decimal)

  const price = getPrice(prices, 'symbol', tokenSymbol)

  const totalBalanceBN = balanceWithDecimals.multipliedBy(price || '0')

  const totalBalance = (
    <BalanceView value={totalBalanceBN} symbol='$' startWithSymbol />
  )

  const time = dayjs(item.timestamp).format('HH:mm')

  const extrinsicHash = transaction.transferNative.extrinsicHash

  const subscanUrl = `${
    subscanLinksByNetwork[blockchainTag.toLowerCase()]
  }${extrinsicHash}`

  const balance = (
    <FormatBalance
      value={new BN(amount).toFormat({ decimalSeparator: '' })}
      decimals={decimal}
      currency={tokenSymbol}
      isGrayDecimal={false}
    />
  )

  const props = {
    icon: icon,
    subscanUrl: subscanUrl,
    time: time,
    address: address,
    balance: balance,
    totalBalance: totalBalance,
    txKind: txKind,
  }

  return (
    <div>
      {isMobile ? (
        <MobileTransfer {...props} />
      ) : (
        <DesktopTransfer {...props} />
      )}
      {!isLastElement && !isMobile && (
        <div className={styles.TransactionDivider}>
          <Divider />
        </div>
      )}
    </div>
  )
}

type DesktopTransferRowProps = {
  icon: string
  subscanUrl: string
  time: string
  address: string
  balance: React.ReactNode
  totalBalance: React.ReactNode
  txKind: string
}

const DesktopTransfer = ({
  icon,
  time,
  address,
  balance,
  subscanUrl,
  totalBalance,
  txKind,
}: DesktopTransferRowProps) => {
  const name = useGetProfileName(address)
  const titleByKind = txKind === 'TRANSFER_TO' ? 'Received' : 'Sent'

  const title = (
    <div className={styles.TransferTitle}>
      {titleByKind} <span>•</span>{' '}
      <ExternalLink
        url={subscanUrl}
        value={
          <MutedDiv className='d-flex align-items-center font-weight-normal'>
            Transfer <HiOutlineExternalLink className='ml-1' />
          </MutedDiv>
        }
      />
    </div>
  )

  return (
    <div className={styles.TransferRow}>
      <div className={styles.FirstCol}>
        <div className={clsx('d-flex align-items-center')}>
          <TxHistoryImage icon={icon} txKind={txKind} size={'large'} />
          <div>
            <div className='font-weight-semibold FontNormal'>{title}</div>
            <MutedDiv>{time}</MutedDiv>
          </div>
        </div>
      </div>
      <div>
        <MutedDiv>{txKind === 'TRANSFER_TO' ? 'From' : 'To'}</MutedDiv>
        <Link
          href={'/[address]'}
          as={`/${address}`}
          className='text-black'
          target='_blank'
          rel='noreferrer'
        >
          <div
            className={clsx({
              ['d-flex']: !name,
            })}
          >
            <AccountPreview
              withAddress={false}
              withName={!!name}
              account={address}
              nameClassName='font-weight-semibold'
            />

            <Address
              accountId={address}
              isShortAddress
              withCopy
              showCopyIcon={!!name}
              withQr={false}
              className={clsx({ ['text-black font-weight-semibold']: !name })}
            />
          </div>
        </Link>
      </div>
      <BalancePart
        balance={balance}
        totalBalance={totalBalance}
        txKind={txKind}
      />
    </div>
  )
}

const MobileTransfer = ({
  icon,
  address,
  balance,
  totalBalance,
  txKind,
}: DesktopTransferRowProps) => {
  const titleByKind = txKind === 'TRANSFER_TO' ? 'Received from' : 'Sent to'

  return (
    <div className={styles.TransferRow}>
      <div className={clsx('d-flex align-items-center')}>
        <TxHistoryImage icon={icon} txKind={txKind} size={34} />
        <div>
          <MutedDiv>{titleByKind}</MutedDiv>
          <Link
            href={'/[address]'}
            as={`/${address}`}
            className='text-black'
            target='_blank'
            rel='noreferrer'
          >
            <AccountPreview
              withAvatar={false}
              withAddress={false}
              account={address}
              className='FontNormal font-weight-semibold'
              nameClassName='font-weight-semibold'
            />
          </Link>
        </div>
      </div>
      <BalancePart
        balance={balance}
        totalBalance={totalBalance}
        txKind={txKind}
      />
    </div>
  )
}

type BalancePartProps = {
  txKind: string
  balance: React.ReactNode
  totalBalance: React.ReactNode
}

const BalancePart = ({ txKind, balance, totalBalance }: BalancePartProps) => (
  <div className='text-right'>
    <div
      className={clsx(styles.Tokens, {
        [styles.RecievedTokens]: txKind === 'TRANSFER_TO',
      })}
    >
      {balance}
    </div>
    <MutedDiv className={styles.Dollars}>{totalBalance}</MutedDiv>
  </div>
)

type TxHistoryImageProps = {
  icon: string
  size: AvatarSize
  txKind: string
}

const TxHistoryImage = ({ icon, size, txKind }: TxHistoryImageProps) => {
  const TxIconByTxKind = txKind === 'TRANSFER_TO' ? RecievedIcon : SentIcon

  return (
    <div className='bs-mr-2 position-relative'>
      <AvatarOrSkeleton
        icon={icon}
        size={size}
        className='align-items-start flex-shrink-none'
      />
      <TxIconByTxKind className={styles.TransactionIcon} />
    </div>
  )
}

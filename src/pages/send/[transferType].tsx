import { getInitialPropsWithRedux } from 'src/rtk/app/nextHelpers'
import { fetchData } from '../../rtk/app/util'
import TransferPage from '@/components/main/TransferPage'

getInitialPropsWithRedux(TransferPage, async ({ dispatch, context }) => {
  fetchData(dispatch)

  const { transferType, asset } = context.query

  return {
    head: {
      title: 'Transfer Page',
    },
    transferType: transferType as string || 'same',
    asset: asset as string,
  }
})

export default TransferPage

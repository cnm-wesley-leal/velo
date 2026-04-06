import { test as base, expect } from '@playwright/test'
import { createConfiguratorActions } from './actions/configuratorActions'
import { createCheckoutActions } from './actions/checkouActions'
import { createOrderLookupActions } from './actions/orderLookupActions'

type AppActions = {
  configurator: ReturnType<typeof createConfiguratorActions>
  checkout: ReturnType<typeof createCheckoutActions>
  orderLookup: ReturnType<typeof createOrderLookupActions>
}

type TestFixtures = {
  app: AppActions
}

const test = base.extend<TestFixtures>({
  app: async ({ page }, use) => {
    await use({
      configurator: createConfiguratorActions(page),
      checkout: createCheckoutActions(page),
      orderLookup: createOrderLookupActions(page),
    })
  },
})

export { test, expect }

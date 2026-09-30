import { useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';

import { useSyncAndDownloadMutation } from '#accounts';
import { SvgTideRefresh } from '#components/tide/icons';
import { TidePage } from '#components/tide/TidePage';
import { useSheetValue } from '#hooks/useSheetValue';
import * as bindings from '#spreadsheet/bindings';

import { CategorySpendingCard } from './CategorySpendingCard';
import { ComingUpCard } from './ComingUpCard';
import { KpiRow } from './KpiRow';
import { ReviewCard } from './ReviewCard';
import { SpendingPaceCard } from './SpendingPaceCard';
import { useDashboardData } from './useDashboardData';

function greetingKey(hour: number) {
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

export function TideDashboard() {
  const { t } = useTranslation();
  const data = useDashboardData();
  const syncAndDownload = useSyncAndDownloadMutation();
  const uncategorizedCount = Number(
    useSheetValue(bindings.uncategorizedCount()) ?? 0,
  );

  const greeting = {
    morning: t('Good morning'),
    afternoon: t('Good afternoon'),
    evening: t('Good evening'),
  }[greetingKey(new Date().getHours())];

  return (
    <TidePage
      title={greeting}
      subtitle={monthUtils.format(monthUtils.currentDay(), 'EEEE, MMMM d')}
      actions={
        <Button
          variant="normal"
          onPress={() => syncAndDownload.mutate({})}
          isDisabled={syncAndDownload.isPending}
          style={{
            height: 40,
            padding: '0 16px',
            borderRadius: 10,
            gap: 8,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          <SvgTideRefresh width={17} height={17} />
          {syncAndDownload.isPending ? t('Syncing…') : t('Sync banks')}
        </Button>
      }
    >
      <KpiRow
        month={data.month}
        lastMonth={data.lastMonth}
        spentSoFar={data.spentSoFar}
        lastMonthAtSameDay={data.lastMonthAtSameDay}
        income={data.income}
        netWorth={data.netWorth}
        netWorthChange={data.netWorthChange}
      />

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 20,
          alignItems: 'stretch',
        }}
      >
        <SpendingPaceCard
          month={data.month}
          lastMonth={data.lastMonth}
          thisMonth={data.thisMonthCumulative}
          lastMonthValues={data.lastMonthCumulative}
          spentSoFar={data.spentSoFar}
          lastMonthAtSameDay={data.lastMonthAtSameDay}
          lastMonthTotal={data.lastMonthTotal}
        />
        <ReviewCard rows={data.review} totalCount={uncategorizedCount} />
      </View>

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 20,
          alignItems: 'stretch',
        }}
      >
        <CategorySpendingCard month={data.month} rows={data.categorySpending} />
        <ComingUpCard rows={data.upcoming} />
      </View>
    </TidePage>
  );
}

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

import { View } from '@actual-app/components/view';

import {
  SvgTideBank,
  SvgTideCalendar,
  SvgTideCard,
  SvgTideChart,
  SvgTideChevronDown,
  SvgTideChevronRight,
  SvgTideHome,
  SvgTideLayers,
  SvgTidePie,
  SvgTideRules,
  SvgTideSettings,
  SvgTideStore,
  SvgTideTag,
} from '#components/tide/icons';
import { TideCountBadge } from '#components/tide/TideCountBadge';
import { useIsTestEnv } from '#hooks/useIsTestEnv';
import { useSheetValue } from '#hooks/useSheetValue';
import { useSyncServerStatus } from '#hooks/useSyncServerStatus';
import * as bindings from '#spreadsheet/bindings';

import { Item } from './Item';
import { SecondaryItem } from './SecondaryItem';

export function PrimaryButtons() {
  const { t } = useTranslation();
  const [isOpen, setOpen] = useState(false);
  const onToggle = useCallback(() => setOpen(open => !open), []);
  const location = useLocation();
  const uncategorizedCount = useSheetValue(bindings.uncategorizedCount());

  const syncServerStatus = useSyncServerStatus();
  const isTestEnv = useIsTestEnv();
  const isUsingServer = syncServerStatus !== 'no-server' || isTestEnv;

  const isActive = [
    '/reports',
    '/schedules',
    '/payees',
    '/rules',
    '/bank-sync',
    '/tags',
    '/settings',
    '/tools',
  ].some(route => location.pathname.startsWith(route));

  useEffect(() => {
    if (isActive) {
      setOpen(true);
    }
  }, [isActive, location.pathname]);

  return (
    <View data-testid="sidebar-primary-buttons" style={{ flexShrink: 0 }}>
      <Item title={t('Dashboard')} Icon={SvgTideHome} to="/dashboard" />
      <Item
        title={t('Transactions')}
        Icon={SvgTideCard}
        to="/transactions"
        badge={
          uncategorizedCount ? (
            <TideCountBadge count={uncategorizedCount} />
          ) : null
        }
      />
      <Item title={t('Accounts')} Icon={SvgTideLayers} to="/net-worth" />
      <Item title={t('Budget')} Icon={SvgTidePie} to="/budget" />
      <Item
        title={t('More')}
        Icon={isOpen ? SvgTideChevronDown : SvgTideChevronRight}
        onClick={onToggle}
        style={{ marginBottom: isOpen ? 4 : 0 }}
        forceActive={!isOpen && isActive}
      />
      {isOpen && (
        <>
          <SecondaryItem
            title={t('Reports')}
            Icon={SvgTideChart}
            to="/reports"
            indent={8}
          />
          <SecondaryItem
            title={t('Recurring')}
            Icon={SvgTideCalendar}
            to="/schedules"
            indent={8}
          />
          <SecondaryItem
            title={t('Payees')}
            Icon={SvgTideStore}
            to="/payees"
            indent={8}
          />
          <SecondaryItem
            title={t('Rules')}
            Icon={SvgTideRules}
            to="/rules"
            indent={8}
          />
          {isUsingServer && (
            <SecondaryItem
              title={t('Bank Sync')}
              Icon={SvgTideBank}
              to="/bank-sync"
              indent={8}
            />
          )}
          <SecondaryItem
            title={t('Tags')}
            Icon={SvgTideTag}
            to="/tags"
            indent={8}
          />
          <SecondaryItem
            title={t('Settings')}
            Icon={SvgTideSettings}
            to="/settings"
            indent={8}
          />
        </>
      )}
    </View>
  );
}

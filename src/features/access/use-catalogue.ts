import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import { webEventApi, webMenuApi, type WebEventInput, type WebMenu } from './api';
import { accessKey, usePagedQuery, useSave } from './use-save';

// ------------------------------------------------------------------ Web Report (web events)
const eventsKey = accessKey('web-events');

export function useWebEvents() {
  return usePagedQuery(accessKey('web-events', 'list'), (page) => webEventApi.page(page), (payload) => payload.webEvents);
}

export function useWebEvent(id: string | undefined) {
  return useQuery({ queryKey: accessKey('web-events', 'one', id), queryFn: () => webEventApi.one(id ?? ''), enabled: !!id });
}

/** Create (no id) or save (id) a web event, then back to the list. */
export function useSaveWebEvent(id: string | undefined) {
  const router = useRouter();

  return useSave((input: WebEventInput) => (id ? webEventApi.update(id, input) : webEventApi.create(input)), [eventsKey], {
    fallback: 'Web event saved.',
    onDone: () => router.back(),
  });
}

export function useDeleteWebEvent() {
  return useSave((id: number) => webEventApi.remove(id), [eventsKey], { fallback: 'Successful.' });
}

// ------------------------------------------------------------------ Web Menu catalogue
const menusKey = accessKey('web-menus');

export interface WebMenuForm {
  id: number | null;
  name: string;
  location: string;
  parent: number;
}

const EMPTY_MENU: WebMenuForm = { id: null, name: '', location: '', parent: 0 };

export function useWebMenus() {
  const query = useQuery({ queryKey: menusKey, queryFn: webMenuApi.list });
  const [form, setForm] = useState<WebMenuForm>(EMPTY_MENU);
  const reset = () => setForm(EMPTY_MENU);

  const save = useSave(() => webMenuApi.save({ webMenuId: form.id, menuName: form.name, menuLocation: form.location, parentId: form.parent }), [menusKey], {
    fallback: 'Menu saved.',
    onDone: reset,
  });
  const remove = useSave((id: number) => webMenuApi.remove(id), [menusKey], { fallback: 'Menu deleted.', onDone: reset });

  return {
    query,
    form,
    setForm,
    reset,
    save,
    remove,
    edit: (menu: WebMenu) => setForm({ id: menu.Id, name: menu.MenuName, location: menu.MenuLocation, parent: menu.ParentId }),
  };
}

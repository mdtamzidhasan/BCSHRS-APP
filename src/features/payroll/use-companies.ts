import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { toast } from '@/components/ui/toast';

import { addCompany, deleteCompany, fetchCompanies, updateCompany, uploadHeaderImage, type Company, type ImageType } from './api';
import type { PickedFile } from '@/components/ui/misc';

const KEY = ['admin', 'payroll', 'companies'];

export function useCompanies() {
  const client = useQueryClient();
  const query = useQuery({ queryKey: KEY, queryFn: fetchCompanies });
  const [editing, setEditing] = useState<Company | null>(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [domain, setDomain] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Company | null>(null);

  const clear = () => {
    setEditing(null);
    setCode('');
    setName('');
    setDomain(null);
  };

  const saved = (message: string | null) => {
    toast.success(message ?? 'Saved.');
    clear();
    void client.invalidateQueries({ queryKey: KEY });
  };

  const input = () => ({ txtCompanyCode: code.trim(), txtCompanyName: name.trim(), ddlDomain: domain ?? query.data?.domains[0] ?? 'BCSHRS1' });

  const save = useMutation({
    mutationFn: () => (editing ? updateCompany(editing.id, input()) : addCompany(input())),
    onSuccess: (response) => saved(response.message),
  });

  const remove = useMutation({
    mutationFn: (company: Company) => deleteCompany(company.id),
    onSuccess: (response) => {
      toast.success(response.message ?? 'Deleted.');
      setToDelete(null);
      void client.invalidateQueries({ queryKey: KEY });
    },
    onError: () => setToDelete(null),
  });

  const edit = (company: Company) => {
    save.reset();
    setEditing(company);
    setCode(company.company_code);
    setName(company.cname);
    setDomain(company.type);
  };

  return { query, editing, code, setCode, name, setName, domain, setDomain, save, remove, edit, cancel: clear, toDelete, setToDelete };
}

export function useUploadHeader() {
  const [file, setFile] = useState<PickedFile | null>(null);
  const [imageType, setImageType] = useState<ImageType>('Header');

  const upload = useMutation({
    mutationFn: () => uploadHeaderImage(file as PickedFile, imageType),
    onSuccess: (response) => {
      toast.success(response.message ?? 'Image saved!');
    },
  });

  return { file, setFile, imageType, setImageType, upload };
}

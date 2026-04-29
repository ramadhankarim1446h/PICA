import Dexie, { type Table } from 'dexie';

export interface PICARecord {
  id?: number;
  Masalah_Issue: string;
  Dampak_Akibat: string;
  Photo_Issue?: string; // Base64 string
  Lokasi: string;
  Tanggal_Issue: string;
  User_Info: string;
  Langkah_Penyelesaian: string;
  PIC_Solusi: string;
  Status_Issue: string;
  Photo_Status?: string; // Base64 string
  Tanggal_Update: string;
  Keterangan: string;
}

export class PICADatabase extends Dexie {
  pica!: Table<PICARecord>;

  constructor() {
    super('PICADatabase');
    this.version(1).stores({
      pica: '++id, Masalah_Issue, PIC_Solusi, Tanggal_Issue, Status_Issue'
    });
  }
}

export const db = new PICADatabase();

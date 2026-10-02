import {sqliteTable,text,index} from 'drizzle-orm/sqlite-core';
export const decisions=sqliteTable('decisions',{id:text('id').primaryKey(),owner:text('owner').notNull(),title:text('title').notNull(),payload:text('payload').notNull(),created:text('created').notNull(),updated:text('updated').notNull()},t=>[index('decisions_owner_updated').on(t.owner,t.updated)]);
export const connections=sqliteTable('connections',{owner:text('owner').primaryKey(),lastCall:text('last_call').notNull()});

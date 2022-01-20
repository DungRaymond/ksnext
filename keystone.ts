// keystone.ts

import { config, list } from '@keystone-6/core';
import { 
  text,
  relationship,
  password,
  timestamp,
  select,
  checkbox,
} from '@keystone-6/core/fields';
import { document } from '@keystone-6/fields-document';
import { Lists } from '.keystone/types';


// !ANCHOR fields goes here

const Post: Lists.Post = list({
  fields: {
    title: text({ validation: { isRequired: true } }),
    slug: text({ isIndexed: 'unique', isFilterable: true }),
    status: select({
      options: [
        { label: 'Published', value: 'published' },
        { label: 'Draft', value: 'draft' },
      ],
      ui: {
        displayMode: 'segmented-control',
      },
    }),
    content: document({
      formatting: true,
      layouts: [
        [1, 1],
        [1, 1, 1],
        [2, 1],
        [1, 2],
        [1, 2, 1],
      ],
      links: true,
      dividers: true,
    }),
    publishDate: timestamp(),
    author: relationship({
      ref: 'User.posts',
      ui: {
        displayMode: 'cards',
        cardFields: ['name'],
        // inlineEdit: { fields: ['name', 'email'] },
        linkToItem: true,
        inlineConnect: true
      },
    }),
    tags: relationship({
      ref: 'Tag.posts',
      ui: {
        displayMode: 'cards',
        cardFields: ['name'],
        inlineEdit: { fields: ['name'] },
        linkToItem: true,
        inlineConnect: true,
        inlineCreate: { fields: ['name'] },
      },
      many: true,
    })
  },
});

const User: Lists.User = list({
  ui: {
    listView: {
      initialColumns: ['name', 'isAdmin'],
    },
  },
  fields: {
    name: text({ validation: { isRequired: true } }),
    email: text({ isIndexed: 'unique', isFilterable: true }),
    password: password(),
    isAdmin: checkbox({
      defaultValue: false
    }),
    posts: relationship({
      ref: 'Post.author',
      many: true
    }),
  },
})

const Tag: Lists.Tag = list({
  ui: {
    isHidden: false,
  },
  fields: {
    name: text(),
    posts: relationship({
      ref: 'Post.tags',
      many: true,
    }),
  },
})


// !ANCHOR authentication goes here

import { createAuth } from "@keystone-6/auth"
import { statelessSessions } from '@keystone-6/core/session';

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',

  sessionData: 'id name isAdmin',
  initFirstItem: {
    fields: ['name', 'email', 'password', 'isAdmin'],
  },
})

const session = statelessSessions({
  secret: '-- EXAMPLE COOKIE SECRET; CHANGE ME --',
  maxAge: 86400 * 7
});

export default withAuth(
  config({
    db: { provider: 'sqlite', url: 'file:./app.db' },
    experimental: {
      generateNextGraphqlAPI: true,
      generateNodeAPI: true,
    },
    lists: { Post, User, Tag },
    session
  })
)

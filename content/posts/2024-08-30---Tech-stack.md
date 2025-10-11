---
title: Create your own technical stack roadmap
date: 2024-08-30T13:00:37.121Z
template: post
draft: true
slug: /posts/tech-stack/
category: Engineering
tags:
  - Engineering
  - Leadership
  - Visualization
  - Documentation
description: Add description here
---
![Mind map of different technologies](assets/mind-map.png)
## What do we want to create

I'm still not entirely sure what is the appropriate name for the result of this endeavor, but lacking a better term, I'll go with **Technology Stack Visualization**.

It's a combination between a mind map, roadmap, graph, etc. so *it is* a kind of **visualization**. In the end it's up to us to pick the best visualization for the data. As we will see later on, as long as we gather the data, we can choose from different ways to visualize it.

**Technology** might not be the ideal word, as we'll also include practices, tools and similar things. But we can think of it in a more general and broader sense of the word.

It's a **stack** because we will add a collection of technologies, tools, services, practices and others. Some of what is needed and used for software engineering, as applied for a specific organization. It's useful to be specific, otherwise we can find already general purpose roadmaps created, for example on [roadmap.sh](https://roadmap.sh).

And to make a good distinction from the start, I'll point out the difference between programming and software engineering as explained in [Software Engineering at Google](https://www.goodreads.com/book/show/48816586-software-engineering-at-google):

> **“Software engineering is programming integrated over time.”** 
> Programming is certainly a significant part of software engineering: after all, programming is how you generate new software in the first place. If you accept this distinction, it also becomes clear that we might need to delineate between programming tasks (development) and software engineering tasks (development, modification, maintenance). The addition of time adds an important new dimension to programming. Cubes aren’t squares, distance isn’t velocity. Software engineering isn’t programming.

## What to include

You might want to get an overview of all the languages and tools you have in your technology stack. Or maybe you want to see what you could learn **and use** right away at your job.

To create a comprehensive view, we can split items at least in three categories:

- **Technologies**: languages, frameworks, major libraries you are using, etc.
- **Tools**: Git, GitHub, Jira, Figma, Jenkins, etc.
- **Practices**: Object oriented programming, functional programming, architecture documentation, etc.

If you want to understand how many topics you have... [TK]

## Why we might need this

[TK] Is this better placed after we create the visualization?

There are countless ways in which this visualization could be useful. This is somewhat dependent on the organization in which you work, how much effort you put in creating it and the depth to which you want to go.

Simple visualization! It's a clear, visual representation of all the technologies and tools we use. This can be helpful for engineering people, but also outside of engineering. [TK] How?

It can serve as documentation for onboarding, either for new employees, or someone new to the organization or to a specific team.

It can help with career planning and growth. As it helps managers discuss and plan future growth areas for engineers. Even for engineers themselves, they can see which parts of the stack they are familiar with and identify some that they might want to learn.

Also, useful for decision-making and planning. It can be pretty obvious that you might want to consolidate technologies or tools. For example if you have 5 different ways to use CSS in your application or 3 different CI tools. In some cases there might be reasons why they are needed, but it's also worth investigating why do we have multiple ways to solve the same problem. 

A visualization like this one is pretty good to get the bigger picture.
## How to create it

Before we actually visualize the data somehow, it can be better to create a rough structure of what we want to include.

This would allow us to focus on the contents, not on the presentation layer. We will make it look nice later on.

Plaint text, or a markdown file is more than enough for this step, as we can generate the main parts.

```
Tech Stack Visualization
	Languages
		JavaScript
		TypeScript
	Frameworks
		React
	Libraries
		Axios
	Programming
		Object oriented
		Functional programming
	Tools
		Git
		GitHub
		Jira
		Figma
		Confluence
	Build
		Webpack
		EsLint
		Vite
		GitHub Actions
	Testing
		Vitest
		Jest
		Cypress

```

Examples are mostly front-end related because this is what I've been working with for the past years so they come easily when I think of something.

It might be that this is all you need, or at least for a while. If you open this in almost any editor, you can collapse nodes and look only at what you need. If that is the case, all great for you.

## How to actually gather everything...

Once we have the context and motivation settled, along with the above starter sketch, we can present this to more people in the engineering organization and get more help with this initiative.

You want at least two things from people:
- feedback for the initiative, who useful they think it is, what should the visualization include, how to use it, etc.
- and actual suggestions about the contents. You can make the markdown/text file a shared document where several people can collaborate

In order to better explain what is this about and to get some feedback you can schedule a kickoff meeting with some people you think might be interested and ask them to add any others they think could help.

After this process is done, we can look into how to make the visualization more... visual.
## Tools

Once we have an idea of what we want to include and to what level we want to go there are countless tools that can be used.
Picking one is more of a personal preference. The most important decision is if we want to use something that will generate a visualization based on our existing data. If we already created it. See the chapter above if skipped.
Or if we want to use a visual tool, that will also act as the source of truth for our technology stack visualization.

Visual tools that I've used and experimented with to create something like this:

- [XMind](https://xmind.app)

If you want to generate a visualization from existing data, you might need to change the format of your data a bit, as not all tools expect the same format. But it is possible!

Import from Markdown -> https://xmind.app/blog/a-markdown-plus-xmind-workflow-for-writing/

Automated tools that can be used:

- [Mermaid](https://mermaid.js.org/syntax/mindmap.html)

The text to diagrams tools are pretty nice to generate all your data, but are usually lacking features that something like XMind has built in. For example adding resources links, statuses and other things. There might be some workarounds for these thoug.

Guess what? GitHub has [support for mermaid](https://github.blog/developer-skills/github/include-diagrams-markdown-files-mermaid/) in your markdown files out of the box. So if this is the place where you want to store this visualization, or you want to use MermaidJs for something else, you can!

In the end it's up to what you prefer and what works best for your scenario.

[TK] Other tools like D2, or Excalidraw. Or Obsidian + Excalidraw + Plugins to generate it from the text above.

## Creative ways to extend it

There are countless ways to extend this and make it even more useful. Sky is the limit, or better said, your time is the limit :)

Depending on the tool of your choice, it might be easier or harder to add any of these things, so you need to investigate a bit.

### Status

This is one of the obvious ones. We might add [jQuery](https://jquery.com) to our list, but we don't plan to use it going forward, and we want to explicitly state this. For these cases, we can add an **obsolete** status to the item.
The opposite is also useful, if we're experimenting with [React Server Components](https://react.dev/reference/rsc/server-components) in a part of our application, but we don't want to add it as a practice yet for everyone, we can mark this as **experimental**.

### Level

If the organization you work in has a career framework (or at least a ladder/levels), you can add a level to each item. **Explicitly state** that this is informative only! Someone's level is not a fixed number of known topics, and you'll have a lot of people understand this the wrong way otherwise.
A level assigned to a topic would ideally mean from where you expect people to be familiar with the topic. For example, you might not add CI/CD or build tools to the first level.

### Resources

We can add links to resources that would help people find out more about a topic. If for example we use React, we might add a link to a course the organization is offering about React. Or some publicly available resource. If a child of this node is React Router, we might add a link to a book detailing how this router works.
We need to be careful with what resources we add, as maintaining a knowledge database like this is not a trivial task.

[TK] What else?

## Conclusion

Creating and maintaining such a visualization could improve our organization's technology management and strategic planning processes. [TK] This does not sound right...

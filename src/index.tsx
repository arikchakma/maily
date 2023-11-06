import { JSONContent } from '@tiptap/core';
import {
	Text,
	Tailwind,
	Html,
	Head,
	Body,
	Font,
	Container,
	Link,
	Heading,
	HeadingAs,
	Hr,
} from '@react-email/components';
import { render as reactEmailRender } from '@react-email/render';
import { cn, generateKey } from './utils';

// {
//   "type": "doc",
//   "content": [
//       {
//           "type": "logo",
//           "attrs": {
//               "src": "/brand/icon.svg",
//               "alt": null,
//               "title": null,
//               "mailbox-component": "logo",
//               "size": "md",
//               "alignment": "left"
//           }
//       },
//       {
//           "type": "spacer",
//           "attrs": {
//               "height": "xl"
//           }
//       },
//       {
//           "type": "heading",
//           "attrs": {
//               "textAlign": "left",
//               "level": 2
//           },
//           "content": [
//               {
//                   "type": "text",
//                   "marks": [
//                       {
//                           "type": "bold"
//                       }
//                   ],
//                   "text": "Discover Maily"
//               }
//           ]
//       },
//       {
//           "type": "paragraph",
//           "attrs": {
//               "textAlign": "left"
//           },
//           "content": [
//               {
//                   "type": "text",
//                   "text": "Are you ready to transform your email communication? Introducing Maily, the powerful email editor that enables you to craft captivating emails effortlessly."
//               }
//           ]
//       },
//       {
//           "type": "paragraph",
//           "attrs": {
//               "textAlign": "left"
//           },
//           "content": [
//               {
//                   "type": "text",
//                   "text": "Elevate your email communication with Maily! Click below to try it out:"
//               }
//           ]
//       },
//       {
//           "type": "button",
//           "attrs": {
//               "mailboxComponent": "button",
//               "text": "Try Maily Now →",
//               "url": "",
//               "alignment": "left",
//               "variant": "filled",
//               "borderRadius": "round",
//               "buttonColor": "#141313",
//               "textColor": "#ffffff"
//           }
//       },
//       {
//           "type": "spacer",
//           "attrs": {
//               "height": "xl"
//           }
//       },
//       {
//           "type": "paragraph",
//           "attrs": {
//               "textAlign": "left"
//           },
//           "content": [
//               {
//                   "type": "text",
//                   "text": "Join our vibrant community of users and developers on GitHub, where Maily is an "
//               },
//               {
//                   "type": "text",
//                   "marks": [
//                       {
//                           "type": "link",
//                           "attrs": {
//                               "href": "https://github.com/arikchakma/maily.to",
//                               "target": "_blank",
//                               "rel": "noopener noreferrer nofollow",
//                               "class": null
//                           }
//                       },
//                       {
//                           "type": "italic"
//                       }
//                   ],
//                   "text": "open-source"
//               },
//               {
//                   "type": "text",
//                   "text": " project. Together, we'll shape the future of email editing."
//               }
//           ]
//       },
//       {
//           "type": "paragraph",
//           "attrs": {
//               "textAlign": "left"
//           },
//           "content": [
//               {
//                   "type": "text",
//                   "text": "Regards,"
//               },
//               {
//                   "type": "hardBreak"
//               },
//               {
//                   "type": "text",
//                   "text": "Arikko"
//               }
//           ]
//       }
//   ]
// }

interface NodeOptions {
	parent?: JSONContent;
	prev?: JSONContent;
	next?: JSONContent;
}

interface RenderOptions {
	pretty?: boolean;
	plainText?: boolean;
}

interface MarkType {
	[key: string]: any;
	type: string;
	attrs?: Record<string, any> | undefined;
}

class Maily {
	private readonly content: JSONContent;

	constructor(content: JSONContent = { type: 'doc', content: [] }) {
		this.content = content;
	}

	render(options?: RenderOptions): string {
		const nodes = this.content?.content || [];
		const jsxNodes = nodes?.map((node, index) => {
			const nodeOptions: NodeOptions = {
				prev: nodes[index - 1],
				next: nodes[index + 1],
				parent: node,
			};

			return this.renderNode(node, nodeOptions);
		});

		const markup = (
			<Tailwind
				config={{
					theme: {
						extend: {
							colors: {
								heading: 'rgb(17, 24, 39)',
								text: 'rgb(55, 65, 81)',
								horizontal: 'rgb(234, 234, 234)',
							},
							fontSize: {
								paragraph: '15px',
							},
						},
					},
				}}
			>
				<Html>
					<head>
						<meta content="text/html; charset=UTF-8" httpEquiv="Content-Type" />
						<Font
							fontFamily="Inter"
							fallbackFontFamily="Verdana"
							webFont={{
								url: 'https://rsms.me/inter/font-files/Inter-Regular.woff2?v=3.19',
								format: 'woff2',
							}}
							fontWeight={400}
							fontStyle="normal"
						/>
					</head>
					<body>
						<Container
							style={{
								maxWidth: '600px',
								minWidth: '300px',
								width: '100%',
								marginLeft: 'auto',
								marginRight: 'auto',
								padding: '0.5rem',
							}}
						>
							{jsxNodes}
						</Container>
					</body>
				</Html>
			</Tailwind>
		);

		return reactEmailRender(markup, options);
	}

	// `getMappedContent` will call corresponding node type
	// and return text content
	private getMappedContent(
		node: JSONContent,
		options?: NodeOptions
	): JSX.Element[] {
		return (
			(node?.content
				?.map((childNode) => {
					return this.renderNode(childNode, options);
				})
				?.filter((node) => node !== null) as JSX.Element[]) || []
		);
	}

	// `renderNode` will call the method of the corresponding node type
	private renderNode(
		node: JSONContent,
		options?: NodeOptions
	): JSX.Element | null {
		const type = node.type!;

		if (type in this) {
			// @ts-ignore
			return this[node.type]?.(node, options);
		} else {
			console.warn(`Node type "${type}" is not supported.`);
			return null;
		}
	}

	// `renderMark` will call the method of the corresponding mark type
	private renderMark(node: JSONContent): JSX.Element {
		// It will wrap the text with the corresponding mark type
		const text = node.text || '&nbsp;';
		const marks = node.marks || [];

		return marks.reduce((acc, mark) => {
			const type = mark.type!;
			if (type in this) {
				// @ts-ignore
				const markElement = this[type]?.(mark, acc);
				return markElement;
			} else {
				console.warn(`Mark type "${type}" is not supported.`);
				return acc;
			}
		}, <>{text}</>);
	}

	paragraph(node: JSONContent, options?: NodeOptions): JSX.Element {
		const { attrs } = node;
		const alignment = attrs?.textAlign || 'left';

		const { parent, next } = options || {};
		const isParentListItem = parent?.type === 'listItem';
		const isNextSpacer = next?.type === 'spacer';

		return (
			<Text
				key={generateKey()}
				className={cn(
					'text-paragraph mb-5 mt-0 text-text antialiased',
					`text-${alignment}`,
					isParentListItem || isNextSpacer ? 'mb-0' : ''
				)}
			>
				{this.getMappedContent(node)}
			</Text>
		);
	}

	text(node: JSONContent) {
		const text = node?.text || '&nbsp';
		if (node?.marks) {
			return this.renderMark(node);
		}

		return text;
	}

	bold(_: MarkType, text: string): JSX.Element {
		return <strong key={generateKey()}>{text}</strong>;
	}

	italic(_: MarkType, text: string): JSX.Element {
		return <em key={generateKey()}>{text}</em>;
	}

	underline(_: MarkType, text: string): JSX.Element {
		return <u key={generateKey()}>{text}</u>;
	}

	strike(_: MarkType, text: string): JSX.Element {
		return (
			<s key={generateKey()} style={{ textDecoration: 'line-through' }}>
				{text}
			</s>
		);
	}

	link(mark: MarkType, text: string): JSX.Element {
		const { attrs } = mark;
		const href = attrs?.href || '#';
		const target = attrs?.target || '_blank';
		const rel = attrs?.rel || 'noopener noreferrer nofollow';

		return (
			<Link
				key={generateKey()}
				href={href}
				target={target}
				rel={rel}
				className="font-medium underline text-heading"
			>
				{text}
			</Link>
		);
	}

	heading(node: JSONContent, options?: NodeOptions): JSX.Element {
		const { attrs } = node;
		const { next } = options || {};

		const level = `h${+attrs?.level || 1}`;
		const alignment = attrs?.textAlign || 'left';
		const isNextSpacer = next?.type === 'spacer';

		return (
			<Heading
				key={generateKey()}
				as="h1"
				className={cn('text-heading mb-3', {
					'text-4xl font-extrabold': level === 'h1',
					'text-3xl font-bold': level === 'h2',
					'text-2xl leading-[38px] font-semibold': level === 'h3',
					'mb-0': isNextSpacer,
				})}
				style={{
					textAlign: alignment,
				}}
			>
				{this.getMappedContent(node)}
			</Heading>
		);
	}

	variable(node: JSONContent): JSX.Element {
		const { attrs } = node;
		const variable = attrs?.id || '';

		return <>{`{{${variable}}}`}</>;
	}

	horizontalRule(node: JSONContent, options?: NodeOptions): JSX.Element {
		return <Hr className="my-8" />;
	}

	orderedList(node: JSONContent, options?: NodeOptions): JSX.Element {
		return (
			<Container key={generateKey()}>
				<ol className="list-decimal mt-0 pl-[26px] mb-5">
					{this.getMappedContent(node)}
				</ol>
			</Container>
		);
	}

	bulletList(node: JSONContent, options?: NodeOptions): JSX.Element {
		return (
			<Container key={generateKey()}>
				<ul key={generateKey()} className="list-disc mt-0 pl-[26px] mb-5">
					{this.getMappedContent(node)}
				</ul>
			</Container>
		);
	}

	listItem(node: JSONContent, options?: NodeOptions): JSX.Element {
		return (
			<li key={generateKey()} className={cn('mb-2 pl-1.5 antialiased')}>
				{this.getMappedContent(node, { ...options, parent: node })}
			</li>
		);
	}
}

const maily = new Maily({
	type: 'doc',
	content: [
		{
			type: 'bulletList',
			content: [
				{
					type: 'listItem',
					attrs: {
						color: null,
					},
					content: [
						{
							type: 'paragraph',
							attrs: {
								textAlign: 'left',
							},
							content: [
								{
									type: 'text',
									text: 'Arik Chakma',
								},
							],
						},
					],
				},
				{
					type: 'listItem',
					attrs: {
						color: null,
					},
					content: [
						{
							type: 'paragraph',
							attrs: {
								textAlign: 'left',
							},
							content: [
								{
									type: 'text',
									text: 'Hello Arikko',
								},
							],
						},
					],
				},
				{
					type: 'listItem',
					attrs: {
						color: null,
					},
					content: [
						{
							type: 'paragraph',
							attrs: {
								textAlign: 'left',
							},
							content: [
								{
									type: 'text',
									text: 'How Are you?',
								},
							],
						},
					],
				},
			],
		},
		{
			type: 'orderedList',
			attrs: {
				start: 1,
			},
			content: [
				{
					type: 'listItem',
					attrs: {
						color: null,
					},
					content: [
						{
							type: 'paragraph',
							attrs: {
								textAlign: 'left',
							},
							content: [
								{
									type: 'text',
									text: 'Number One',
								},
							],
						},
					],
				},
				{
					type: 'listItem',
					attrs: {
						color: null,
					},
					content: [
						{
							type: 'paragraph',
							attrs: {
								textAlign: 'left',
							},
							content: [
								{
									type: 'text',
									text: 'Number ',
								},
								{
									type: 'text',
									marks: [
										{
											type: 'bold',
										},
									],
									text: '2',
								},
							],
						},
					],
				},
			],
		},
	],
});

console.log(maily.render());

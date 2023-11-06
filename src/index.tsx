import { JSONContent } from '@tiptap/core';
import { Text } from '@react-email/text';
import { Html } from '@react-email/html';
import { Head } from '@react-email/head';
import { Body } from '@react-email/body';
import { render as reactEmailRender } from '@react-email/render';
import { generateKey } from './utils';

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

class Maily {
	private readonly content: JSONContent;

	constructor(content: JSONContent = { type: 'doc', content: [] }) {
		this.content = content;
	}

	render(options?: RenderOptions): string {
		const nodes = this.content?.content || [];
		const jsxNodes = nodes?.map((node, index) => {
			const options: NodeOptions = {
				prev: nodes[index - 1],
				next: nodes[index + 1],
				parent: node,
			};

			return this.renderNode(node);
		});

		const markup = (
			<Html>
				<Head></Head>
				<Body>{jsxNodes}</Body>
			</Html>
		);

		return reactEmailRender(markup, options);
	}

	// `getMappedContent` will call corresponding node type
	// and return text content
	private getMappedContent(node: JSONContent): JSX.Element[] {
		return (
			node?.content?.map((childNode) => {
				return this.renderNode(childNode);
			}) || []
		);
	}

	// `renderNode` will call the method of the corresponding node type
	private renderNode(node: JSONContent): JSX.Element {
		const type = node.type!;

		if (type in this) {
			// @ts-ignore
			return this[node.type]?.(node);
		} else {
			console.warn(`Node type "${type}" is not supported.`);
			return <></>;
		}
	}

	// `renderMark` will call the method of the corresponding mark type
	private renderMark(node: JSONContent): JSX.Element {
		// It will wrap the text with the corresponding mark type
		const text = node.text || '&nbsp;';
		const marks = node.marks || [];

		return marks.reduce((acc: JSX.Element, mark) => {
			const type = mark.type!;
			if (type in this) {
				// @ts-ignore
				const markElement = this[type]?.(acc);
				return markElement;
			} else {
				console.warn(`Mark type "${type}" is not supported.`);
				return acc;
			}
		}, <>{text}</>);
	}

	paragraph(node: JSONContent, options?: Partial<NodeOptions>): JSX.Element {
		const { attrs } = node;
		const alignment = attrs?.textAlign || 'left';

		return <Text key={generateKey()}>{this.getMappedContent(node)}</Text>;
	}

	text(node: JSONContent) {
		const text = node?.text || '&nbsp';
		if (node?.marks) {
			return this.renderMark(node);
		}

		return text;
	}

	bold(text: string): JSX.Element {
		return <strong key={generateKey()}>{text}</strong>;
	}

	italic(text: string): JSX.Element {
		return <em key={generateKey()}>{text}</em>;
	}

	underline(text: string): JSX.Element {
		return <u key={generateKey()}>{text}</u>;
	}

	strike(text: string): JSX.Element {
		return (
			<s key={generateKey()} style={{ textDecoration: 'line-through' }}>
				{text}
			</s>
		);
	}
}

const maily = new Maily({
	type: 'doc',
	content: [
		{
			type: 'paragraph',
			attrs: {
				textAlign: 'left',
			},
			content: [
				{
					type: 'text',
					text: 'Are you ready to transform your email communication? Introducing Maily, the powerful email editor that enables you to craft captivating emails effortlessly.',
				},
			],
		},
		{
			type: 'paragraph',
			attrs: {
				textAlign: 'left',
			},
			content: [
				{
					type: 'text',
					text: 'Elevate your email communication with ',
				},
				{
					type: 'text',
					marks: [
						{ type: 'strike' },
						{
							type: 'bold',
						},
					],
					text: 'Maily',
				},
				{
					type: 'text',
					text: '! Click below to try it out:',
				},
			],
		},
	],
});

console.log(maily.render());

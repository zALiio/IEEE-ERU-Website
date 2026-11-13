import tasbeehImg from '../assets/img/tasbeeh.webp'
import zahyImg from '../assets/img/zahy.webp'
import azazyImg from '../assets/img/azazy.webp'
import hamssaImg from '../assets/img/hamssa.webp'
import counselorImg from '../assets/img/counselor.webp'

export const SITE_CARDS_KEY = 'site_cards'

export const SITE_CARD_DEFAULTS = {
  officers: [
    { id: 'officer-1', name: 'TASBEEH MAHMOUD', role: 'BRANCH_CHAIR', clearance: 'CLEARANCE_LVL_MAX', code: 'CH-001', image_url: tasbeehImg, icon: 'ShieldCheck' },
    { id: 'officer-2', name: 'ZAHY ADEL', role: 'VICE_CHAIR', clearance: 'CLEARANCE_LVL_01', code: 'VC-001', image_url: zahyImg, icon: 'Users' },
    { id: 'officer-3', name: 'MOHAMED EL AZAZY', role: 'TREASURER', clearance: 'CLEARANCE_LVL_01', code: 'TR-001', image_url: azazyImg, icon: 'Zap' },
    { id: 'officer-4', name: 'HAMSSA HOSSAM', role: 'SECRETARY', clearance: 'CLEARANCE_LVL_01', code: 'SC-001', image_url: hamssaImg, icon: 'FileText' },
  ],
  counselor: {
    id: 'counselor-1',
    name: 'DR. WAEL BADAWY',
    position: 'Senior Branch Counselor',
    image_url: counselorImg,
  },
  committees: [
    { id: 'committee-operations', name: 'Operations', summary: 'Ensure smooth execution of IEEE ERU activities by handling logistics and organizing events from start to finish.', responsibilities: ['Arrange venues, equipment, and catering.', 'Organize event schedules, coordinate volunteers.', 'Collaborate with teams for resource efficiency.'], icon: 'Settings' },
    { id: 'committee-event-planning', name: 'Event Planning', summary: 'Research, create, and reinvent innovative ideas for competitions and events within IEEE ERU.', responsibilities: ['Research and invent new competition ideas.', 'Recreate existing events with high creativity.', 'Collaborate with teams to implement concepts.'], icon: 'Rocket' },
    { id: 'committee-multimedia', name: 'Multimedia', summary: 'Capture memorable moments and key events to showcase IEEE ERU’s vibrant community through photos and videos.', responsibilities: ['Capture high-quality event photos and videos.', 'Coordinate with designers for seamless content.', 'Support overall marketing with visual assets.'], icon: 'Camera' },
    { id: 'committee-marketing', name: 'Marketing', summary: 'Promote IEEE ERU through strategic campaigns, social media, and audience engagement.', responsibilities: ['Plan and execute marketing campaigns.', 'Manage social media accounts and calendars.', 'Analyze metrics and optimize outreach.'], icon: 'BarChart3' },
    { id: 'committee-graphic-design', name: 'Graphic Design', summary: 'Create eye-catching visuals to represent our identity and support the branch with creative content.', responsibilities: ['Design logos, posters, and social graphics.', 'Ensure brand consistency across all platforms.', 'Prepare files for print and digital use.'], icon: 'Palette' },
    { id: 'committee-video-editing', name: 'Video Editing', summary: 'Produce engaging video content that promotes IEEE ERU events and activities.', responsibilities: ['Edit event footage into polished videos.', 'Add effects, transitions, and soundtracks.', 'Work closely with photography and design.'], icon: 'Video' },
    { id: 'committee-human-resources', name: 'Human Resources', summary: 'Support the branch by recruiting, coordinating, and engaging our volunteers and members.', responsibilities: ['Manage recruitment and onboarding.', 'Track participation and member engagement.', 'Facilitate communication and resolution.'], icon: 'Users2' },
    { id: 'committee-public-relations', name: 'Public Relations', summary: 'Manage IEEE ERU’s external communications and maintain a positive global image.', responsibilities: ['Write press releases and newsletters.', 'Build relationships with university contacts.', 'Represent IEEE ERU at community events.'], icon: 'MessageSquare' },
  ],
}

export const cloneSiteCards = () => JSON.parse(JSON.stringify(SITE_CARD_DEFAULTS))

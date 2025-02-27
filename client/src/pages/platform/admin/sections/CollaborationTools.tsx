import { useState } from "react";
import { 
  MessageSquare, Users, Bell, Settings, Pin, 
  Hash, Lock, Globe, Plus, Search, Filter,
  ThumbsUp, MessageCircle, Share2, Bookmark
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface Channel {
  id: string;
  name: string;
  description: string;
  type: "team" | "department" | "announcement";
  visibility: "public" | "private";
  members: number;
  lastActive: string;
  pinnedTopics: Topic[];
}

interface Topic {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  createdAt: string;
  likes: number;
  comments: number;
  isPinned: boolean;
  tags: string[];
}

const sampleChannels: Channel[] = [
  {
    id: "1",
    name: "Underwriting Team",
    description: "Collaboration space for loan underwriters",
    type: "team",
    visibility: "private",
    members: 15,
    lastActive: "2023-12-10T15:30:00",
    pinnedTopics: [
      {
        id: "1",
        title: "Updated Underwriting Guidelines",
        content: "Please review the new guidelines for commercial loans...",
        author: {
          name: "Sarah Johnson",
          role: "Lead Underwriter"
        },
        createdAt: "2023-12-09T10:00:00",
        likes: 12,
        comments: 5,
        isPinned: true,
        tags: ["guidelines", "important"]
      }
    ]
  },
  {
    id: "2",
    name: "Company Announcements",
    description: "Official announcements and updates",
    type: "announcement",
    visibility: "public",
    members: 150,
    lastActive: "2023-12-10T14:00:00",
    pinnedTopics: [
      {
        id: "2",
        title: "Q4 Performance Update",
        content: "Review of our Q4 performance and goals for next quarter...",
        author: {
          name: "John Smith",
          role: "CEO"
        },
        createdAt: "2023-12-08T09:00:00",
        likes: 45,
        comments: 12,
        isPinned: true,
        tags: ["quarterly-update", "company-wide"]
      }
    ]
  },
  {
    id: "3",
    name: "Risk Assessment",
    description: "Risk team discussions and updates",
    type: "department",
    visibility: "private",
    members: 25,
    lastActive: "2023-12-10T13:15:00",
    pinnedTopics: [
      {
        id: "3",
        title: "New Risk Assessment Framework",
        content: "Implementation details for the updated risk framework...",
        author: {
          name: "Michael Chen",
          role: "Risk Manager"
        },
        createdAt: "2023-12-07T11:00:00",
        likes: 18,
        comments: 8,
        isPinned: true,
        tags: ["risk", "framework"]
      }
    ]
  }
];

export const CollaborationTools = () => {
  const [channels, setChannels] = useState<Channel[]>(sampleChannels);
  const [searchTerm, setSearchTerm] = useState("");

  const getChannelIcon = (type: Channel["type"]) => {
    switch (type) {
      case "team":
        return Users;
      case "department":
        return MessageSquare;
      case "announcement":
        return Bell;
      default:
        return MessageSquare;
    }
  };

  const getVisibilityIcon = (visibility: Channel["visibility"]) => {
    return visibility === "public" ? Globe : Lock;
  };

  return (
    <div className="space-y-6">
      {/* Actions Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search channels and discussions..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Channel
          </Button>
        </div>
      </div>

      {/* Channels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {channels.map((channel) => {
          const ChannelIcon = getChannelIcon(channel.type);
          const VisibilityIcon = getVisibilityIcon(channel.visibility);
          
          return (
            <Card key={channel.id} className="p-4">
              {/* Channel Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <ChannelIcon className="h-5 w-5 text-blue-500" />
                    <h3 className="text-lg font-semibold">{channel.name}</h3>
                    <Badge variant="outline" className="flex items-center">
                      <VisibilityIcon className="h-3 w-3 mr-1" />
                      {channel.visibility}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{channel.description}</p>
                </div>
                <Button variant="outline" size="sm">
                  Join Channel
                </Button>
              </div>

              {/* Channel Stats */}
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {channel.members} members
                </div>
                <div>
                  Last active: {new Date(channel.lastActive).toLocaleDateString()}
                </div>
              </div>

              {/* Pinned Topics */}
              {channel.pinnedTopics.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center text-sm font-medium text-gray-500">
                    <Pin className="h-4 w-4 mr-1" />
                    Pinned Topics
                  </div>
                  {channel.pinnedTopics.map((topic) => (
                    <div key={topic.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{topic.title}</h4>
                        <div className="flex items-center space-x-2">
                          {topic.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {topic.content}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            {topic.likes}
                          </div>
                          <div className="flex items-center">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            {topic.comments}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="icon">
                            <Bookmark className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}; 
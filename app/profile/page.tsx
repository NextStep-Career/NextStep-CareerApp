"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Sparkles,
  User,
  Mail,
  Settings,
  Shield,
  Bell,
  LogOut,
  Edit2,
  Save,
  X,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useAuth } from "@/lib/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  )
}

function ProfileContent() {
  const { user, userProfile, logout } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: userProfile?.name || user?.displayName || "",
    email: user?.email || "",
    bio: userProfile?.bio || "",
    location: userProfile?.location || "",
    linkedinUrl: userProfile?.linkedinUrl || "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    // TODO: Implement profile update logic
    console.log("Saving profile:", formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      name: userProfile?.name || user?.displayName || "",
      email: user?.email || "",
      bio: userProfile?.bio || "",
      location: userProfile?.location || "",
      linkedinUrl: userProfile?.linkedinUrl || "",
    })
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      {/* Header */}
      <div className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold font-[family-name:var(--font-space-grotesk)]">NextStep</span>
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-[family-name:var(--font-space-grotesk)] mb-2">Profile</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Left Column - Profile Info */}
          <div className="md:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="font-[family-name:var(--font-space-grotesk)] flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Personal Information</span>
                </CardTitle>
                <CardDescription>Update your personal details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-foreground">{formData.name || "Not provided"}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <div className="flex items-start space-x-2 mt-1">
                      <Mail className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm text-foreground break-all">{formData.email}</p>
                          <Badge variant="secondary" className="text-xs whitespace-nowrap">Verified</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  {isEditing ? (
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      placeholder="City, Country"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-foreground">{formData.location || "Not provided"}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  {isEditing ? (
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      placeholder="Tell us about yourself"
                      className="min-h-[100px]"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-foreground">{formData.bio || "No bio provided"}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn Profile</Label>
                  {isEditing ? (
                    <Input
                      id="linkedin"
                      value={formData.linkedinUrl}
                      onChange={(e) => handleInputChange("linkedinUrl", e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-foreground">
                      {formData.linkedinUrl ? (
                        <Link href={formData.linkedinUrl} target="_blank" className="text-primary hover:underline">
                          {formData.linkedinUrl}
                        </Link>
                      ) : (
                        "Not provided"
                      )}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Career Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="font-[family-name:var(--font-space-grotesk)]">Career Progress</CardTitle>
                <CardDescription>Your journey with NextStep</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">3</p>
                    <p className="text-sm text-muted-foreground">Career Matches</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">62%</p>
                    <p className="text-sm text-muted-foreground">Learning Progress</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">7</p>
                    <p className="text-sm text-muted-foreground">Day Streak</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">1</p>
                    <p className="text-sm text-muted-foreground">Tasks Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Settings & Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="font-[family-name:var(--font-space-grotesk)] text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/quiz">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Retake Personality Quiz
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/dashboard">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="font-[family-name:var(--font-space-grotesk)] text-lg flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Email Notifications</span>
                  </div>
                  <input type="checkbox" className="toggle" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Privacy Mode</span>
                  </div>
                  <input type="checkbox" className="toggle" />
                </div>
                <Separator />
                <Button 
                  variant="destructive" 
                  className="w-full justify-start"
                  onClick={() => logout()}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle className="font-[family-name:var(--font-space-grotesk)] text-lg">Account Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>Member since: {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Recently'}</p>
                <p>Last sign in: {user?.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : 'Today'}</p>
                <p>Account type: Free</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

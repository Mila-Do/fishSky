export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      flashcards: {
        Row: {
          aiMetadata: Json | null
          back: string
          createdAt: string
          deletedAt: string | null
          front: string
          generationId: string | null
          id: string
          source: Database["public"]["Enums"]["flashcardSource"]
          status: Database["public"]["Enums"]["flashcardStatus"]
          updatedAt: string
          userId: string
        }
        Insert: {
          aiMetadata?: Json | null
          back: string
          createdAt?: string
          deletedAt?: string | null
          front: string
          generationId?: string | null
          id?: string
          source: Database["public"]["Enums"]["flashcardSource"]
          status?: Database["public"]["Enums"]["flashcardStatus"]
          updatedAt?: string
          userId: string
        }
        Update: {
          aiMetadata?: Json | null
          back?: string
          createdAt?: string
          deletedAt?: string | null
          front?: string
          generationId?: string | null
          id?: string
          source?: Database["public"]["Enums"]["flashcardSource"]
          status?: Database["public"]["Enums"]["flashcardStatus"]
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcardsGenerationId_fkey"
            columns: ["generationId"]
            isOneToOne: false
            referencedRelation: "generations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flashcardsUserId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      generationErrorLogs: {
        Row: {
          createdAt: string
          errorCode: string
          errorMessage: string
          id: string
          model: string
          sourceTextHash: string
          sourceTextLength: number
          userId: string
        }
        Insert: {
          createdAt?: string
          errorCode: string
          errorMessage: string
          id?: string
          model: string
          sourceTextHash: string
          sourceTextLength: number
          userId: string
        }
        Update: {
          createdAt?: string
          errorCode?: string
          errorMessage?: string
          id?: string
          model?: string
          sourceTextHash?: string
          sourceTextLength?: number
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "generationErrorLogsUserId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      generations: {
        Row: {
          acceptedEditedCount: number
          acceptedUneditedCount: number
          createdAt: string
          generatedCount: number
          generationDuration: number
          id: string
          model: string
          sourceTextHash: string
          sourceTextLength: number
          updatedAt: string
          userId: string
        }
        Insert: {
          acceptedEditedCount?: number
          acceptedUneditedCount?: number
          createdAt?: string
          generatedCount?: number
          generationDuration: number
          id?: string
          model: string
          sourceTextHash: string
          sourceTextLength: number
          updatedAt?: string
          userId: string
        }
        Update: {
          acceptedEditedCount?: number
          acceptedUneditedCount?: number
          createdAt?: string
          generatedCount?: number
          generationDuration?: number
          id?: string
          model?: string
          sourceTextHash?: string
          sourceTextLength?: number
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "generationsUserId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          createdAt: string
          email: string
          id: string
          passwordHash: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          email: string
          id?: string
          passwordHash: string
          updatedAt?: string
        }
        Update: {
          createdAt?: string
          email?: string
          id?: string
          passwordHash?: string
          updatedAt?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      citext: {
        Args: { "": string } | { "": boolean } | { "": unknown }
        Returns: string
      }
      citext_hash: {
        Args: { "": string }
        Returns: number
      }
      citextin: {
        Args: { "": unknown }
        Returns: string
      }
      citextout: {
        Args: { "": string }
        Returns: unknown
      }
      citextrecv: {
        Args: { "": unknown }
        Returns: string
      }
      citextsend: {
        Args: { "": string }
        Returns: string
      }
    }
    Enums: {
      flashcardSource: "manual" | "ai-full" | "ai-edited"
      flashcardStatus: "pending" | "accepted" | "rejected" | "custom"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      flashcardSource: ["manual", "ai-full", "ai-edited"],
      flashcardStatus: ["pending", "accepted", "rejected", "custom"],
    },
  },
} as const

